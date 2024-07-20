import sgMail from "@sendgrid/mail";

import "dotenv/config";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMail = async (email, verifyToken) => {
  const mail = sgMail.send({
    to: email,
    from: process.env.EMAIL_SENDER,
    subject: "Welcome to AquaTrack",
    html: `To confirm your email please click on the <a href="https://aquatrack-api-crcb.onrender.com/api/users/verify/${verifyToken}">link</a>`,
    text: `To confirm your email please open the link https://aquatrack-api-crcb.onrender.com/api/users/verify/${verifyToken}`,
  });
  return mail;
};
