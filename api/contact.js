import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    phone,
    email,
    message,
    city,
    service,
    details,
    company,        // honeypot
    attribution,    // { utm_source, utm_medium, utm_campaign, gclid, landing_page, referrer }
  } = req.body || {};

  // Honeypot — bots will fill this; humans never see it.
  // Return 200 so the bot moves on without retrying.
  if (company && String(company).trim() !== '') {
    return res.status(200).json({ success: true, suppressed: true });
  }

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  // Server-side phone sanity (very loose — just digits ≥ 10)
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid phone number.' });
  }

  const isQuoteForm = !!(service || city);
  const subject = isQuoteForm
    ? `New Quote Request — ${name} (${city || 'Unknown Area'})`
    : `New Contact Message — ${name}`;

  // ====== Attribution block (so Paul sees which ad/landing page produced the lead) ======
  const attr = attribution && typeof attribution === 'object' ? attribution : {};
  const attrLines = [
    attr.landing_page ? `Landing page: ${attr.landing_page}` : null,
    attr.utm_source   ? `Source: ${attr.utm_source}`         : null,
    attr.utm_medium   ? `Medium: ${attr.utm_medium}`         : null,
    attr.utm_campaign ? `Campaign: ${attr.utm_campaign}`     : null,
    attr.utm_content  ? `Content: ${attr.utm_content}`       : null,
    attr.utm_term     ? `Term: ${attr.utm_term}`             : null,
    attr.gclid        ? `gclid: ${attr.gclid}`               : null,
    attr.referrer     ? `Referrer: ${attr.referrer}`         : null,
  ].filter(Boolean);
  const attrText = attrLines.length ? `\n\n--- Attribution ---\n${attrLines.join('\n')}` : '';
  const attrHtml = attrLines.length
    ? `<div style="margin-top:24px;padding:14px 16px;background:rgba(244,241,236,0.04);border:1px solid rgba(244,241,236,0.06);font-size:12px;line-height:1.7;color:#8a9bb0;font-family:'JetBrains Mono',monospace;">${attrLines
        .map((l) => l.replace(/</g, '&lt;'))
        .join('<br>')}</div>`
    : '';

  const bodyText = (
    isQuoteForm
      ? [
          `NAME: ${name}`,
          `PHONE: ${phone}`,
          `EMAIL: ${email || 'Not provided'}`,
          `CITY / AREA: ${city || 'Not provided'}`,
          `SERVICE NEEDED: ${service || 'Not provided'}`,
          `DETAILS: ${details || 'None'}`,
        ]
      : [
          `NAME: ${name}`,
          `PHONE: ${phone}`,
          `EMAIL: ${email || 'Not provided'}`,
          `MESSAGE: ${message || 'None'}`,
        ]
  ).join('\n') + attrText;

  const cardHeader = isQuoteForm ? 'New Quote Request' : 'New Contact Message';
  const heading = isQuoteForm
    ? `Quote Request from <span style="color:#f5a623;">${name}</span>`
    : `Message from <span style="color:#f5a623;">${name}</span>`;

  const rowsHtml = isQuoteForm
    ? `
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;"><a href="tel:${phone.replace(/\D/g, '')}" style="color:#f5a623;">${phone}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${email || '<em style="color:#8a9bb0;">Not provided</em>'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">City / Area</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${city || '—'}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Service</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${service || '—'}</td></tr>
        <tr><td style="padding:10px 0;color:#8a9bb0;font-size:13px;vertical-align:top;">Details</td><td style="padding:10px 0;line-height:1.6;">${details || '—'}</td></tr>`
    : `
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);font-weight:500;"><a href="tel:${phone.replace(/\D/g, '')}" style="color:#f5a623;">${phone}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);color:#8a9bb0;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(244,241,236,0.08);">${email || '<em style="color:#8a9bb0;">Not provided</em>'}</td></tr>
        <tr><td style="padding:10px 0;color:#8a9bb0;font-size:13px;vertical-align:top;">Message</td><td style="padding:10px 0;line-height:1.6;">${message || '—'}</td></tr>`;

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0b0d;color:#f4f1ec;padding:32px;border-radius:8px;">
      <div style="margin-bottom:24px;">
        <span style="background:#f5a623;color:#0a0b0d;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:4px;">${cardHeader}</span>
      </div>
      <h2 style="margin:0 0 24px;font-size:22px;font-weight:600;">${heading}</h2>
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
      ${attrHtml}
      <div style="margin-top:24px;padding:16px;background:rgba(245,166,35,0.08);border-left:3px solid #f5a623;border-radius:0 4px 4px 0;font-size:13px;color:#8a9bb0;">
        Sent via areawidepaving.net · Area Wide Paving Contact Form
      </div>
    </div>`;

  try {
    const emailPayload = {
      from: 'Area Wide Paving <hello@areawidepaving.net>',
      to: ['paulpogue1219@yahoo.com'],
      subject,
      html: htmlBody,
      text: bodyText,
    };
    if (email && email.trim()) emailPayload.reply_to = email.trim();

    const { data, error } = await resend.emails.send(emailPayload);
    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email. Please call us directly at (903) 885-6388.' });
    }
    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again or call (903) 885-6388.' });
  }
}
