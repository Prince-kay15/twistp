import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "princekay043@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { name, email, topic, message, scheduled_at, timezone } = body ?? {};

    // Validation
    if (!name || !email || !scheduled_at) {
      return json({ error: "Name, email, and time are required" }, 400);
    }
    if (typeof name !== "string" || name.length > 100) return json({ error: "Invalid name" }, 400);
    if (typeof email !== "string" || email.length > 255 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "Invalid email" }, 400);
    }
    const when = new Date(scheduled_at);
    if (isNaN(when.getTime())) return json({ error: "Invalid date" }, 400);
    if (when.getTime() < Date.now() + 30 * 60 * 1000) {
      return json({ error: "Please pick a slot at least 30 minutes from now" }, 400);
    }
    if (topic && (typeof topic !== "string" || topic.length > 200)) return json({ error: "Invalid topic" }, 400);
    if (message && (typeof message !== "string" || message.length > 2000)) return json({ error: "Message too long" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check slot is still free
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("scheduled_at", when.toISOString())
      .in("status", ["pending", "accepted"])
      .maybeSingle();
    if (existing) return json({ error: "That slot was just taken. Please pick another." }, 409);

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        topic: topic?.trim() || null,
        message: message?.trim() || null,
        scheduled_at: when.toISOString(),
        timezone: timezone || "UTC",
      })
      .select("id, approval_token, scheduled_at, name, email, topic, message, timezone")
      .single();

    if (error) {
      console.error("Insert error:", error);
      if ((error as any).code === "23505") {
        return json({ error: "That slot was just taken. Please pick another." }, 409);
      }
      return json({ error: "Could not save booking" }, 500);
    }

    // Send admin notification with approve/decline links
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const origin = req.headers.get("origin") || "https://twistp.lovable.app";
    const projectUrl = Deno.env.get("SUPABASE_URL")!;
    const approveUrl = `${projectUrl}/functions/v1/manage-booking?id=${booking.id}&token=${booking.approval_token}&action=accept`;
    const declineUrl = `${projectUrl}/functions/v1/manage-booking?id=${booking.id}&token=${booking.approval_token}&action=decline`;

    if (RESEND_API_KEY) {
      const dt = new Date(booking.scheduled_at);
      const html = `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="color:#06b6d4;">📅 New Booking Request</h2>
          <p><strong>${escapeHtml(booking.name)}</strong> (${escapeHtml(booking.email)}) requested a Zoom session.</p>
          <p><strong>Time:</strong> ${dt.toUTCString()}<br/>
             <strong>Their timezone:</strong> ${escapeHtml(booking.timezone || "UTC")}</p>
          ${booking.topic ? `<p><strong>Topic:</strong> ${escapeHtml(booking.topic)}</p>` : ""}
          ${booking.message ? `<p><strong>Message:</strong><br/>${escapeHtml(booking.message).replace(/\n/g, "<br/>")}</p>` : ""}
          <div style="margin:30px 0;">
            <a href="${approveUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:10px;">✓ Accept & Create Zoom</a>
            <a href="${declineUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">✗ Decline</a>
          </div>
          <p style="color:#666;font-size:12px;">Or manage from your <a href="${origin}/admin">admin dashboard</a>.</p>
        </div>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "TWIST Bookings <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `New booking: ${booking.name} — ${dt.toUTCString()}`,
          html,
          reply_to: booking.email,
        }),
      }).catch((e) => console.error("Admin email failed:", e));
    }

    return json({ success: true, id: booking.id });
  } catch (e) {
    console.error("create-booking error:", e);
    return json({ error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}