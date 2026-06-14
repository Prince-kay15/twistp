import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RECIPIENT_EMAIL = "princekay043@gmail.com";

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, service, tutoringType, contentType, message } = await req.json();

    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (name.length > 100 || email.length > 255 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input exceeds maximum length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const serviceLabels: Record<string, string> = {
      web: "Web Development",
      software: "Software Engineering",
      cctv: "CCTV Installation",
      telecom: "Telecom Installation",
      tutoring: "Full Stack Web Dev Tutoring",
      content: "Content Creation",
    };

    const tutoringLabels: Record<string, string> = {
      frontend: "Frontend Only",
      backend: "Backend Only",
      fullstack: "Full Stack",
    };

    const contentLabels: Record<string, string> = {
      collaboration: "Collaboration",
      sponsor: "Sponsor",
      modeling: "Modeling",
      brand_advert: "Brand Advert",
      ambassadorship: "Ambassadorship",
    };

    const serviceName = serviceLabels[service] || service || "Not specified";
    const tutoringName = tutoringType ? (tutoringLabels[tutoringType] || tutoringType) : null;
    const contentName = contentType ? (contentLabels[contentType] || contentType) : null;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeService = escapeHtml(serviceName);
    const safeTutoring = tutoringName ? escapeHtml(tutoringName) : null;
    const safeContent = contentName ? escapeHtml(contentName) : null;
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="margin: 20px 0;">
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Service:</strong> ${safeService}</p>
          ${safeTutoring ? `<p><strong>Tutoring Focus:</strong> ${safeTutoring}</p>` : ""}
          ${safeContent ? `<p><strong>Content Type:</strong> ${safeContent}</p>` : ""}
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Sent from TWIST Portfolio Contact Form</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TWIST Contact <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        subject: `New Contact: ${name} - ${serviceName}`.slice(0, 200),
        html: htmlContent,
        reply_to: email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", res.status, data);
      return new Response(
        JSON.stringify({ error: "Could not send message. Please try again later." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Could not send message. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
