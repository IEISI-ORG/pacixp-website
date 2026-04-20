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
      const formType = data['form-type'] || 'membership-application';
      
      // Basic validation
      let requiredFields = [];
      let subject = "";
      let title = "";
      
      if (formType === 'general-contact') {
        requiredFields = ['name', 'email', 'subject', 'message'];
        subject = `Contact Inquiry: ${data['subject']}`;
        title = "General Contact Inquiry";
      } else {
        requiredFields = ['org-name', 'asn', 'contact-name', 'contact-email'];
        subject = `Membership Application: ${data['org-name']}`;
        title = "New Membership Application";
      }

      for (const field of requiredFields) {
        if (!data[field]) {
          return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      }

      // Generate HTML Email
      const generateHtmlEmail = (title, fields) => {
        const rows = Object.entries(fields)
          .filter(([key]) => key !== 'form-type')
          .map(([key, value]) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; color: #0B1829; width: 150px; text-transform: capitalize;">${key.replace(/-/g, ' ')}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${value}</td>
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
                <div style="font-size: 14px; color: #FFCE60; font-weight: 600; margin-top: 5px;">${title}</div>
              </div>
              <div class="content">
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

      const htmlBody = generateHtmlEmail(title, data);

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
          subject: subject,
          html: htmlBody,
        }),
      });

      const result = await sendEmail.json();

      if (!sendEmail.ok) {
        console.error("Resend Error:", result);
        return new Response(JSON.stringify({ error: "Failed to send notification email" }), {
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
