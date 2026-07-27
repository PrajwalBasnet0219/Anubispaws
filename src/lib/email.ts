import nodemailer from "nodemailer";

// Create a single reusable transporter instance using your Gmail credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    text: `Your verification code is: ${code}`,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: `"AnubisPaws" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Welcome to AnubisPaws, ${name}!`,
    text: `Hi ${name}, Welcome to AnubisPaws! We are thrilled to have you join our pet-loving community.`,
    html: `<h1>Welcome, ${name}!</h1><p>We are thrilled to have you join AnubisPaws. Enjoy exploring our platform!</p>`,
  });
}