const  emailSender  = require('./emailService')

const sendEmailFun = async ({ to, subject, text, html }) => {
    try {
        const result = await emailSender(to, subject, text, html);
        return result.success; // Return only success status
    } catch (error) {
        console.error(" Email sending error:", error.message);
        return false; // Return false if there's an error
    }
};

module.exports = sendEmailFun;
