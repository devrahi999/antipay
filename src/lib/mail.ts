
import nodemailer from 'nodemailer';

/**
 * Final robust SMTP Configuration for Gmail.
 * Using manual host/port configuration which is more reliable than 'service' alias.
 */

const SMTP_USER = process.env.SMTP_USER || 'supports.antipay@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || 'nynl muik mktr yyyk').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  // Adding connection limits and timeouts for stability
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000, // 10 seconds
});

export async function sendCustomEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    // 1. Verify connection first (Handshake)
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP Connection Verify Error:', error);
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    // 2. Send the actual mail
    const info = await transporter.sendMail({
      from: `"AntiPay" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email successfully sent. MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Log detailed failure context
    console.error('CRITICAL EMAIL FAILURE:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return { success: false, error: error.message || 'SMTP Authentication/Connection Failed' };
  }
}
