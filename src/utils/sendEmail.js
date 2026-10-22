const dns = require("dns");
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const nodemailer = require("nodemailer");

const GOOGLE_SCRIPT_WEBHOOK = process.env.MAIL_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbylYbKrj0KsVPOdeOqacYzNGDRmxO7gY-4W0KEjyF7ukCtjf4gj4EMamM_GmmuGSX7c/exec";

const sendEmail = async ({ to, subject, html, text }) => {
    // 1. Primary: Use Google Apps Script Webhook (Uses HTTPS Port 443 - 100% bypasses Render firewall & delivers to inbox)
    if (GOOGLE_SCRIPT_WEBHOOK) {
        try {
            console.log(`[Email Service] Delivering email to ${to} via Google Apps Script Webhook...`);
            const res = await fetch(GOOGLE_SCRIPT_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    to,
                    subject,
                    html: html || `<p>${text || ''}</p>`,
                    text: text || ""
                })
            });

            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                if (data.success !== false) {
                    console.log(`[Email Service] Email delivered successfully to ${to} via Google Webhook!`);
                    return { success: true, messageId: `gas-${Date.now()}` };
                }
            }
            console.warn(`[Email Service] Google Webhook status ${res.status}, falling back to Nodemailer...`);
        } catch (webhookErr) {
            console.warn("[Email Service] Google Webhook error, falling back to Nodemailer:", webhookErr.message);
        }
    }

    // 2. Fallback: Nodemailer SMTP
    try {
        const port = parseInt(process.env.SMTP_PORT) || 587;
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: port,
            secure: isSecure,
            family: 4,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"KasperTech DMS" <${process.env.SMTP_USER || 'no-reply@kaspertech.com'}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("[Email Service] Email sent successfully via Nodemailer: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("[Email Service] Error sending email via Nodemailer:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
