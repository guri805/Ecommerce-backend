const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL, // Gmail email (Use App Password)
        pass: process.env.EMAIL_PASS, // App Password from Google
    }
});

// Function to send an email
async function emailSender(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL, 
            to,
            subject,
            text,
            html
        });
        console.log(" Email sent successfully:", info);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(" Error sending email:", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = emailSender; // Export as a function
