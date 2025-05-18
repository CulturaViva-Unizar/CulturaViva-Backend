require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('../logger/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendNotification = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `CulturaViva Notifications <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
    });

    logger.info(`Correo enviado: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error al enviar el correo: ${error.message}`);
    throw new Error('Error al enviar el correo');
  }
};

module.exports = { sendNotification };
