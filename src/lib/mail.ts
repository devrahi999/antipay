
import nodemailer from 'nodemailer';

/**
 * SMTP Configuration optimized for Gmail.
 * Ensure SMTP_USER and SMTP_PASS (App Password) are set in your environment.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, // Use the 16-character App Password
  },
});

export async function sendCustomEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: `"AntiPay Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('SMTP Error:', error);
    return { success: false, error };
  }
}
