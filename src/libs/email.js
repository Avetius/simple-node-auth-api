import nodemailer from 'nodemailer';

export default nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service: 'yahoo',
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  debug: false,
  logger: true,
});

// return transporter.sendMail({
//   from: process.env.EMAIL,
//   to: createlogin.email,
//   subject: 'Email verification',
//   html: `Dear client!  <br>
// If you registered please verify your mail by <a href="${process.env.HOST}/users/verify_email/${user.email_verification_token}">clicking to this link</a> otherwise just ignore it`,
// }, (err, info) => {
//   if (err) {
//     return User.query().where({ id: user.id }).delete()
//       .then(() => res.status(500).send({ code: 500, message: 'Error sending email verification' }))
//       .catch((e) => next(e));
//   }
//   if (info) console.log('email sending done!');
//   return response(res, user);
// });

// export async function sendMail(To) {
//   await transporter.sendMail({
//     from: `noreply@${process.env.HOST} <${process.env.EMAIL}>`, // sender address
//     to: 'bar@example.com, baz@example.com', // list of receivers
//     subject: 'Email verification ✔', // Subject line
//     text: 'Hello world?', // plain text body
//     html: '<b>Hello world?</b>', // html body
//   });
// }

// const EmailVerificationText = `Dear client!  <br> If you registered please verify your mail by <a href="${process.env.HOST}/users/verify_email/${user.email_verification_token}">clicking to this link</a> otherwise just ignore it`;
