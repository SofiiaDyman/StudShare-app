const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
}

async function sendVerificationCode(email, code) {
    if (!transporter) {
        console.log(`[DEV] Код підтвердження для ${email}: ${code}`);
        return;
    }
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'StudShare: код підтвердження',
        text: `Ваш код підтвердження: ${code}\nВін діє 15 хвилин.`
    });
}

module.exports = { sendVerificationCode };