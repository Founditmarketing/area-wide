import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, message, city, service, details } = req.body;

  // Basic validation
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  // Build the email body based on which form was submitted
  const isQuoteForm = !!(service || city);
  const subject = isQuoteForm
    ? `New Quote Request — ${name} (${city || 'Unknown Area'})`
    : `New Contact Message — ${name}`;

  const bodyText = isQuoteForm
    ? [
        `NAME: ${name}`,
        `PHONE: ${phone}`,
        `EMAIL: ${email || 'Not provided'}`,
        `CITY / AREA: ${city || 'Not provided'}`,
        `SERVICE NEEDED: ${service || 'Not provided'}`,
        `DETAILS: ${details || 'None'}`,
      ].join('\n')
    : [
        `NAME: ${name}`,
        `PHONE: ${phone}`,
        `EMAIL: ${email || 'Not provided'}`,
        `MESSAGE: ${message || 'None'}`,
      ].join('\n');

  const htmlBody = isQuoteForm
    ? `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b0d;color:#f4f1ec;padding:32px;border-radius:8px;">
        <div style="margin-bottom:24px;">
          <span style="background:#f5a623;color:#0a0b0d;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;">New Quote Request</span>
        </div>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;">Quote Request from <span style="color:#f5a623;">${name}</span></h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;"><a href="tel:${phone.replace(/\D/g,'')}" style="color:#f5a623;">${phone}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${email || '<em style="color:#8a9bb0;">Not provided</em>'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">City / Area</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${city || '—'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Service</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${service || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#8a9bb0;font-size:13px;vertical-align:top;">Details</td><td style="padding:10px 0;line-height:1.6;">${details || '—'}</td></tr>
        </table>
        <div style="margin-top:32px;padding:16px;background:rgba(245,166,35,0.08);border-left:3px solid #f5a623;border-radius:0 4px 4px 0;font-size:13px;color:#8a9bb0;">
          Sent via areawidepaving.com · Area Wide Paving Contact Form
        </div>
      </div>`
    : `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b0d;color:#f4f1ec;padding:32px;border-radius:8px;">
        <div style="margin-bottom:24px;">
          <span style="background:#f5a623;color:#0a0b0d;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;">New Contact Message</span>
        </div>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;">Message from <span style="color:#f5a623;">${name}</span></h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;"><a href="tel:${phone.replace(/\D/g,'')}" style="color:#f5a623;">${phone}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${email || '<em style="color:#8a9bb0;">Not provided</em>'}</td></tr>
          <tr><td style="padding:10px 0;color:#8a9bb0;font-size:13px;vertical-align:top;">Message</td><td style="padding:10px 0;line-height:1.6;">${message || '—'}</td></tr>
        </table>
        <div style="margin-top:32px;padding:16px;background:rgba(245,166,35,0.08);border-left:3px solid #f5a623;border-radius:0 4px 4px 0;font-size:13px;color:#8a9bb0;">
          Sent via areawidepaving.com · Area Wide Paving Contact Form
        </div>
      </div>`;

  try {
    const emailPayload = {
      from: 'Area Wide Paving <hello@areawidepaving.com>',
      to: ['owen@founditmarketing.com'],
      subject,
      html: htmlBody,
      text: bodyText,
    };

    // Set reply_to only if user provided an email
    if (email && email.trim()) {
      emailPayload.reply_to = email.trim();
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email. Please call us directly at (903) 885-6388.' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again or call (903) 885-6388.' });
  }
}
