import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  'email-verification': (data) => ({
    subject: 'Verify your LocalLink account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E07A5F; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🌏 LocalLink</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Welcome, ${data.name}!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <a href="${data.verificationUrl}" style="display: inline-block; background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
        </div>
      </div>
    `,
  }),
  'password-reset': (data) => ({
    subject: 'Reset your LocalLink password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E07A5F; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🌏 LocalLink</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${data.name},</h2>
          <p>We received a request to reset your password.</p>
          <a href="${data.resetUrl}" style="display: inline-block; background: #E07A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      </div>
    `,
  }),
  'booking-confirmation': (data) => ({
    subject: `Booking Confirmed: ${data.experienceTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #E07A5F; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🌏 LocalLink</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Your booking is confirmed!</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${data.experienceTitle}</h3>
            <p>📅 ${data.date} at ${data.time}</p>
            <p>👥 ${data.guests} guests</p>
            <p>📍 ${data.meetingPoint}</p>
            <p>💰 Total: ${data.total}</p>
          </div>
          <p>Your guide <strong>${data.guideName}</strong> will meet you at the meeting point.</p>
        </div>
      </div>
    `,
  }),
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Skip email sending in dev mode when SKIP_EXTERNAL_SERVICES is true
  if (process.env.SKIP_EXTERNAL_SERVICES === 'true') {
    logger.info(`[DEV] Skipping email to ${options.to}: ${options.subject || options.template}`);
    return;
  }

  try {
    let html = options.html;
    let subject = options.subject;

    if (options.template && templates[options.template]) {
      const template = templates[options.template](options.data);
      html = template.html;
      subject = template.subject;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'LocalLink <noreply@locallink.app>',
      to: options.to,
      subject,
      html,
      text: options.text,
    });

    logger.info(`Email sent to ${options.to}: ${subject}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};
