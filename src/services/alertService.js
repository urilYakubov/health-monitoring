const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendHealthAlertEmail({ to, subject, message }) {
  const mailOptions = {
    from: `"Health Monitor" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<p>${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Failed to send alert email:', err);
  }
}

module.exports = { sendHealthAlertEmail };
