const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const isGmail = (process.env.SMTP_HOST || "").toLowerCase().includes("gmail") || 
                        (process.env.SMTP_USER || "").toLowerCase().includes("gmail");

        const port = isGmail ? 465 : (parseInt(process.env.SMTP_PORT) || 465);
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: port,
            secure: isSecure,
            family: 4, // CRITICAL: Force IPv4 to eliminate ENETUNREACH on Render/cloud platforms
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
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
        console.log("Email sent successfully: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
