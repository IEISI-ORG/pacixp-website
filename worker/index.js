// The site is served on both hostnames; only its pages may post the forms
const ALLOWED_ORIGINS = new Set(["https://www.pacixp.net", "https://pacixp.net"]);

const MAX_BODY_LENGTH = 16 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ASN_RE = /^(AS)?\s?\d{1,10}$/i;

// Values of the location dropdown in apply.html
const LOCATIONS = {
  "american-samoa": "American Samoa",
  "cook-islands": "Cook Islands",
  "fiji": "Fiji",
  "french-polynesia": "French Polynesia",
  "guam": "Guam",
  "kiribati": "Kiribati",
  "marshall-islands": "Marshall Islands",
  "micronesia": "Micronesia (Federated States of)",
  "nauru": "Nauru",
  "new-caledonia": "New Caledonia",
  "niue": "Niue",
  "northern-mariana-islands": "Northern Mariana Islands",
  "palau": "Palau",
  "papua-new-guinea": "Papua New Guinea",
  "samoa": "Samoa",
  "solomon-islands": "Solomon Islands",
  "tonga": "Tonga",
  "tuvalu": "Tuvalu",
  "vanuatu": "Vanuatu",
  "wallis-and-futuna": "Wallis and Futuna",
  "other": "Other / Regional Hub",
};

const PEERING_POLICIES = {
  open: "Open",
  selective: "Selective",
  restrictive: "Restrictive",
};

// Only these fields are accepted and emailed, in this order. Keep the max
// lengths in step with the maxlength attributes on the form inputs.
const FORMS = {
  "membership-application": {
    title: "New Membership Application",
    subjectPrefix: "Membership Application",
    subjectField: "org-name",
    replyToField: "contact-email",
    fields: [
      { key: "org-name", label: "Organisation", required: true, max: 200 },
      { key: "asn", label: "ASN", required: true, max: 16, pattern: ASN_RE },
      { key: "peeringdb", label: "PeeringDB", max: 300 },
      { key: "contact-name", label: "Contact name", required: true, max: 200 },
      { key: "contact-email", label: "Contact email", required: true, max: 254, pattern: EMAIL_RE },
      { key: "location", label: "Location", required: true, options: LOCATIONS },
      { key: "peering-policy", label: "Peering policy", options: PEERING_POLICIES },
      { key: "notes", label: "Notes", max: 5000 },
    ],
  },
  "general-contact": {
    title: "General Contact Inquiry",
    subjectPrefix: "Contact Inquiry",
    subjectField: "subject",
    replyToField: "email",
    fields: [
      { key: "name", label: "Name", required: true, max: 200 },
      { key: "email", label: "Email", required: true, max: 254, pattern: EMAIL_RE },
      { key: "organisation", label: "Organisation", max: 200 },
      { key: "subject", label: "Subject", required: true, max: 200 },
      { key: "message", label: "Message", required: true, max: 5000 },
    ],
  },
};

const json = (body, status, cors) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "X-Content-Type-Options": "nosniff", ...cors },
});

// Collapse line breaks/control characters and cap length for the email subject
const cleanSubject = (input) => {
  const text = String(input ?? '').replace(/[\x00-\x1F\x7F\s]+/g, ' ').trim();
  return text.length > 100 ? `${text.slice(0, 99)}…` : text;
};

// Escape submitted text before inserting it into the email HTML
const escapeHtml = (input) => String(input ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Returns { values } with trimmed strings for the form's known fields, or { error }
const validate = (form, data) => {
  const values = {};
  for (const field of form.fields) {
    const raw = data[field.key];
    if (raw !== undefined && typeof raw !== "string") {
      return { error: `Invalid field: ${field.key}` };
    }
    const value = (raw ?? "").trim();
    if (!value) {
      if (field.required) return { error: `Missing required field: ${field.key}` };
      continue;
    }
    const invalid = field.options
      ? !Object.hasOwn(field.options, value)
      : value.length > field.max || (field.pattern && !field.pattern.test(value));
    if (invalid) return { error: `Invalid field: ${field.key}` };
    values[field.key] = value;
  }
  return { values };
};

const generateHtmlEmail = (form, values) => {
  const rows = form.fields
    .filter((field) => values[field.key])
    .map((field) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #0B1829; width: 150px;">${escapeHtml(field.label)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333; white-space: pre-wrap;">${escapeHtml(field.options ? field.options[values[field.key]] : values[field.key])}</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Open Sans', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: #0B1829; color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-family: 'Montserrat', sans-serif; color: #2BC0B5; }
        .content { padding: 30px; }
        .table { width: 100%; border-collapse: collapse; }
        .footer { background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PACIXP</h1>
          <div style="font-size: 14px; color: #FFCE60; font-weight: 600; margin-top: 5px;">${form.title}</div>
        </div>
        <div class="content">
          <p style="margin: 0 0 20px; font-size: 13px; color: #666;">Submitted through the public website form. Treat links in it with care.</p>
          <table class="table">
            ${rows}
          </table>
        </div>
        <div class="footer">
          <p>&copy; 2024–2026 Pacific Islands Internet Exchange Incorporated</p>
          <p>New Zealand Incorporation No. 50210954 | NZBN 9429052168000</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = ALLOWED_ORIGINS.has(origin);
    const cors = allowed
      ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" }
      : { "Vary": "Origin" };

    if (request.method === "OPTIONS") {
      if (!allowed) return new Response(null, { status: 403, headers: cors });
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: { ...cors, "Allow": "POST, OPTIONS" } });
    }

    try {
      // Every POST counts, so malformed spam is throttled too
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const { success } = await env.FORM_LIMITER.limit({ key: ip });
      if (!success) return json({ error: "Too many requests" }, 429, cors);

      if (!allowed) return json({ error: "Forbidden" }, 403, cors);

      if (!(request.headers.get("Content-Type") ?? "").startsWith("application/json")) {
        return json({ error: "Expected application/json" }, 415, cors);
      }

      if (Number(request.headers.get("Content-Length")) > MAX_BODY_LENGTH) {
        return json({ error: "Request too large" }, 413, cors);
      }
      // Content-Length can be absent (chunked), so check the body itself too
      const raw = await request.text();
      if (raw.length > MAX_BODY_LENGTH) return json({ error: "Request too large" }, 413, cors);

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return json({ error: "Invalid JSON" }, 400, cors);
      }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return json({ error: "Invalid JSON" }, 400, cors);
      }

      const formType = data['form-type'];
      if (typeof formType !== "string" || !Object.hasOwn(FORMS, formType)) {
        return json({ error: "Unknown form type" }, 400, cors);
      }
      const form = FORMS[formType];

      const { values, error } = validate(form, data);
      if (error) return json({ error }, 400, cors);

      // Send email via Resend
      if (!env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY environment variable");
        return json({ error: "Server configuration error" }, 500, cors);
      }

      const sendEmail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'PACIXP Website <no-reply@pacixp.net>',
          to: ['info@pacixp.net'],
          reply_to: values[form.replyToField],
          subject: `${form.subjectPrefix}: ${cleanSubject(values[form.subjectField])}`,
          html: generateHtmlEmail(form, values),
        }),
      });

      if (!sendEmail.ok) {
        // Read as text: Resend's error body is not always JSON
        console.error("Resend error:", sendEmail.status, await sendEmail.text());
        return json({ error: "Failed to send notification email" }, 502, cors);
      }

      return json({ success: true }, 200, cors);
    } catch (err) {
      // Log details for observability; don't expose internals to the client
      console.error("Unhandled error:", err);
      return json({ error: "Internal server error" }, 500, cors);
    }
  },
};
