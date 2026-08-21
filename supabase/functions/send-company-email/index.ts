import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  recipientEmail: string;
  companyName: string;
  type: 'approved' | 'rejected';
  rejectionReason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { recipientEmail, companyName, type, rejectionReason } = payload;

    if (!recipientEmail || !companyName || !type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payload. Required fields: recipientEmail, companyName, type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const emailjsPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY');
    const emailjsPrivateKey = Deno.env.get('EMAILJS_PRIVATE_KEY');

    // Fallback: Check if user configured EmailJS REST API secrets
    if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
      const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          accessToken: emailjsPrivateKey || undefined,
          template_params: {
            to_email: recipientEmail,
            company_name: companyName,
            status_type: type.toUpperCase(),
            subject: type === 'approved' ? 'Interora Company Registration Approved' : 'Interora Company Registration Update',
            rejection_reason: rejectionReason || 'N/A',
            login_link: 'https://interora.app/login',
          },
        }),
      });

      if (!emailjsRes.ok) {
        const errText = await emailjsRes.text();
        console.error('[send-company-email] EmailJS Error:', errText);
        return new Response(
          JSON.stringify({ success: false, error: `EmailJS API error: ${errText}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully via EmailJS' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Secondary Free Provider: Brevo (Sendinblue) Free API
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (brevoApiKey) {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'Interora TPO Portal', email: 'no-reply@interora.app' },
          to: [{ email: recipientEmail, name: companyName }],
          subject: type === 'approved' ? 'Interora Company Registration Approved' : 'Interora Company Registration Update',
          htmlContent: type === 'approved'
            ? `<div style="font-family: Arial, sans-serif; padding:20px;"><h2>Interora — TPO Portal</h2><p>Dear <strong>${companyName}</strong>,</p><p>Your company registration has been officially <strong style="color:green;">APPROVED</strong>. You may now log in to the Company Workspace.</p><p><a href="https://interora.app/login">Log In Now</a></p></div>`
            : `<div style="font-family: Arial, sans-serif; padding:20px;"><h2>Interora — TPO Portal</h2><p>Dear <strong>${companyName}</strong>,</p><p>Your company application was not approved.</p><p><strong>Reason:</strong> ${rejectionReason || 'Criteria not met'}</p></div>`,
        }),
      });

      const brevoData = await brevoRes.json();
      if (!brevoRes.ok) {
        return new Response(
          JSON.stringify({ success: false, error: brevoData.message || 'Brevo API error' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully via Brevo' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tertiary Fallback: Check Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Interora TPO Portal <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: type === 'approved' ? 'Interora Company Registration Approved' : 'Interora Company Registration Update',
          html: `<div style="font-family: Arial, sans-serif; padding:20px;"><h2>Interora — TPO Portal</h2><p>Dear <strong>${companyName}</strong>,</p><p>Status: ${type.toUpperCase()}</p></div>`,
        }),
      });

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        return new Response(
          JSON.stringify({ success: false, error: resendData.message || 'Resend API error (Onboarding mode restricted to verified email)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully via Resend' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'No email API secret configured. Please set EMAILJS_SERVICE_ID / EMAILJS_PUBLIC_KEY or BREVO_API_KEY in Supabase secrets.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Edge Function internal error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
