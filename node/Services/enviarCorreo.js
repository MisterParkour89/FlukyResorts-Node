import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'flukyresorts@gmail.com',
    pass: 'bdeo zaxy lsnc wobj' 
  }
});

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: 'flukyresorts@gmail.com',
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
};




