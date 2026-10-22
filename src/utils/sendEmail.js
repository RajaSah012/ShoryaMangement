const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const isGmail = (process.env.SMTP_HOST || "").toLowerCase().includes("gmail") || 
                        (process.env.SMTP_USER || "").toLowerCase().includes("gmail") ||
                        !process.env.SMTP_HOST;

        const transportConfig = isGmail
            ? {
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000
              }
            : {
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: parseInt(process.env.SMTP_PORT) || 465,
                secure: String(process.env.SMTP_PORT) === "465" || !process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000
              };

        const transporter = nodemailer.createTransport(transportConfig);

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"KasperTech DMS" <no-reply@kaspertech.com>',
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
};

module.exports = sendEmail;
