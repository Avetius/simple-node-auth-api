import nodemailer from 'nodemailer';

export default nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service: 'yahoo',
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});
