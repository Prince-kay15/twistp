import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, id, token } = await req.json();
    if (!id || !token || !action) return json({ error: "Missing fields" }, 400);
    if (typeof id !== "string" || typeof token !== "string") return json({ error: "Invalid input" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, name, email, topic, message, scheduled_at, timezone, status, meeting_link, approval_token")
      .eq("id", id)
      .maybeSingle();

    if (error || !booking) return json({ error: "Not found" }, 404);
    if (booking.approval_token !== token) return json({ error: "Unauthorized" }, 403);

    if (action === "get") {
      const { approval_token, ...safe } = booking;
      return json({ booking: safe });
    }

    if (action === "cancel") {
      if (booking.status !== "pending") {
        return json({ error: `Cannot cancel a ${booking.status} booking` }, 400);
      }
      const { error: upErr } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (upErr) return json({ error: "Could not cancel" }, 500);
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("booking-status error:", e);
    return json({ error: "Server error" }, 500);
  }
});