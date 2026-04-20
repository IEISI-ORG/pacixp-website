export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const data = await request.json();
      
      // Basic validation
      const requiredFields = ['org-name', 'asn', 'contact-name', 'contact-email'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      }

      // Prepare email content
      const emailBody = `
        New Membership Application received for PACIXP:
        
        Organisation: ${data['org-name']}
        ASN: ${data['asn']}
        Technical Contact: ${data['contact-name']} (${data['contact-email']})
        Location: ${data['location']}
        Peering Policy: ${data['peering-policy']}
        
        Notes:
        ${data['notes'] || 'None'}
      `;

      // Send email via Resend
      if (!env.RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY environment variable");
        return new Response(JSON.stringify({ error: "Server configuration error" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      const sendEmail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'PACIXP Website <no-reply@pacixp.net>',
          to: ['terry.sweetser@pacixp.net'],
          subject: `Membership Application: ${data['org-name']}`,
          text: emailBody,
        }),
      });

      const result = await sendEmail.json();

      if (!sendEmail.ok) {
        console.error("Resend Error:", result);
        return new Response(JSON.stringify({ error: "Failed to send application email" }), {
          status: sendEmail.status,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
