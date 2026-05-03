import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zoom Server-to-Server OAuth token
async function getZoomToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID")!;
  const clientId = Deno.env.get("ZOOM_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET")!;
  const auth = btoa(`${clientId}:${clientSecret}`);
  const r = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    { method: "POST", headers: { Authorization: `Basic ${auth}` } }
  );
  if (!r.ok) throw new Error(`Zoom token failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return j.access_token;
}

async function createZoomMeeting(token: string, opts: {
  topic: string; start_time: string; duration: number; timezone: string;
}) {
  const r = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2, // scheduled
      start_time: opts.start_time,
      duration: opts.duration,
      timezone: opts.timezone,
      settings: { join_before_host: false, waiting_room: true, mute_upon_entry: true },
    }),
  });
  if (!r.ok) throw new Error(`Zoom create failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");
  const action = url.searchParams.get("action");

  if (!id || !token || !action || !["accept", "decline"].includes(action)) {
    return htmlResponse("Invalid link.", 400);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .eq("approval_token", token)
      .maybeSingle();

    if (fetchErr || !booking) return htmlResponse("Booking not found or link is invalid.", 404);
    if (booking.status !== "pending") {
      return htmlResponse(`This booking was already <strong>${booking.status}</strong>.`);
    }

    let zoomJoin: string | null = null;
    let zoomStart: string | null = null;
    let zoomMeetingId: string | null = null;
    let newStatus = action === "accept" ? "accepted" : "declined";

    if (action === "accept") {
      try {
        const zToken = await getZoomToken();
        const meeting = await createZoomMeeting(zToken, {
          topic: booking.topic || `Session with ${booking.name}`,
          start_time: new Date(booking.scheduled_at).toISOString().replace(/\.\d{3}Z$/, "Z"),
          duration: booking.duration_minutes,
          timezone: booking.timezone || "UTC",
        });
        zoomJoin = meeting.join_url;
        zoomStart = meeting.start_url;
        zoomMeetingId = String(meeting.id);
      } catch (e) {
        console.error("Zoom error:", e);
        return htmlResponse(`Zoom meeting could not be created: ${(e as Error).message}`, 500);
      }
    }

    const { error: updErr } = await supabase
      .from("bookings")
      .update({
        status: newStatus,
        zoom_join_url: zoomJoin,
        zoom_start_url: zoomStart,
        zoom_meeting_id: zoomMeetingId,
      })
      .eq("id", id);
    if (updErr) return htmlResponse("Failed to update booking.", 500);

    // Email the user
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const dt = new Date(booking.scheduled_at);
      const html =
        action === "accept"
          ? `
            <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#10b981;">✅ Your Zoom session is confirmed</h2>
              <p>Hi ${escapeHtml(booking.name)},</p>
              <p>Your session is scheduled for:</p>
              <p style="font-size:18px;"><strong>${dt.toUTCString()}</strong><br/>
                 (${escapeHtml(booking.timezone || "UTC")})</p>
              <p style="margin:30px 0;">
                <a href="${zoomJoin}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Join Zoom Meeting</a>
              </p>
              <p style="color:#666;font-size:13px;">Link: <a href="${zoomJoin}">${zoomJoin}</a></p>
              <p>See you soon!<br/>— TWIST</p>
            </div>`
          : `
            <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#ef4444;">Booking update</h2>
              <p>Hi ${escapeHtml(booking.name)},</p>
              <p>Unfortunately your requested session for <strong>${dt.toUTCString()}</strong> isn't available. Please pick another time on the website.</p>
              <p>— TWIST</p>
            </div>`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "TWIST Bookings <onboarding@resend.dev>",
          to: [booking.email],
          subject: action === "accept" ? "Your Zoom session is confirmed ✅" : "Booking update",
          html,
        }),
      }).catch((e) => console.error("User email failed:", e));
    }

    return htmlResponse(
      action === "accept"
        ? `<h2 style="color:#10b981">✅ Booking accepted</h2><p>Zoom meeting created and the user has been emailed the link.</p>`
        : `<h2 style="color:#ef4444">Booking declined</h2><p>The user has been notified.</p>`
    );
  } catch (e) {
    console.error("manage-booking error:", e);
    return htmlResponse("Server error.", 500);
  }
});

function htmlResponse(body: string, status = 200) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>Booking</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}.card{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:40px;max-width:500px;text-align:center;}</style></head><body><div class="card">${body}</div></body></html>`,
    { status, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } }
  );
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}