const nodemailer = require('nodemailer');
require('dotenv').config();
const logger = require('../utils/logger');
const alertModel = require("../models/alertModel");

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
    logger.error('Failed to send alert email', {
	  message: err.message,
	  stack: err.stack,
	  to,
	  subject,
	  message
	});
  }
}

async function acknowledgeAlert(alertId, doctorId) {
  if (!alertId || !doctorId) {
    throw new Error("Invalid input");
  }

  return await alertModel.acknowledge(alertId, doctorId);
}

async function acknowledgeAllForPatient(patientId, doctorId) {
  if (!patientId) {
    throw new Error("Patient ID is required");
  }

  const updated = await alertModel.acknowledgeAllForPatient(patientId, doctorId);

  return {
    message: "Alerts acknowledged",
    updated_count: updated.rowCount
  };
}

module.exports = { sendHealthAlertEmail, acknowledgeAlert, acknowledgeAllForPatient };
