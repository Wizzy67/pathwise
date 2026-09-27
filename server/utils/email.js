import nodemailer from 'nodemailer';

/**
 * Dispatches transactional email via Brevo REST API v3
 * Official Brevo Endpoint: POST https://api.brevo.com/v3/smtp/email
 */
export const sendViaBrevo = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'security@pathwise.edu.ng').trim();
  const senderName = (process.env.BREVO_SENDER_NAME || 'PathWise Security').trim();

  console.log(`📬 [BREVO API] Sending email to ${toEmail} via Brevo API v3 (sender: ${senderEmail})...`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail, name: toName || 'Student' }],
      subject,
      htmlContent,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || JSON.stringify(data);
    console.error(`❌ [BREVO API ERROR] (${response.status}): ${errorMsg}`);
    throw new Error(`Brevo API Error: ${errorMsg}`);
  }

  console.log(`✅ [BREVO API SUCCESS] Email delivered. Message ID: ${data.messageId}`);
  return { success: true, provider: 'brevo', messageId: data.messageId };
};

/**
 * Creates and returns an active Nodemailer transporter.
 * If SMTP_USER and SMTP_PASS are set in .env, connects to real SMTP (Gmail, Brevo SMTP, custom).
 * Otherwise falls back to creating an Ethereal test account.
 */
const getTransporter = async () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    const isGmail =
      process.env.SMTP_SERVICE === 'gmail' ||
      (process.env.SMTP_HOST && process.env.SMTP_HOST.toLowerCase().includes('gmail')) ||
      (user && user.toLowerCase().endsWith('@gmail.com'));

    const cleanPass = pass.replace(/\s+/g, '');

    if (isGmail) {
      console.log(`📬 [EMAIL] Connecting via Gmail SMTP service (${user})...`);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user.trim(),
          pass: cleanPass,
        },
      });
    }

    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    console.log(`📬 [EMAIL] Connecting via SMTP (${host}:${port}, secure=${secure})...`);
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: user.trim(),
        pass: cleanPass,
      },
    });
  }

  console.log('📬 [EMAIL] No SMTP credentials found in .env. Creating Ethereal Test Account...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Dispatches a welcome email to a newly registered user.
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to PathWise! 🚀 Discover Your Academic Path';
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #20428B, #2A52A8); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to PathWise, ${userName}!</h1>
          <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 13px;">Delta State University · Academic & Career Guidance</p>
        </div>
        <div style="padding: 40px 30px; line-height: 1.6; font-size: 16px;">
          <p>Hi ${userName},</p>
          <p>We are thrilled to welcome you to <strong>PathWise</strong> — your intelligent academic and career advisor customized for Delta State University students.</p>
          
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #20428B;">
            <p style="margin: 0; font-weight: 700; color: #0f172a; margin-bottom: 5px;">Mandatory Career Assessment</p>
            <p style="margin: 0; font-size: 14px; color: #475569;">To unlock personalized course recommendations, skill analyses, and career match scores, complete the <strong>Career Assessment</strong> on your dashboard.</p>
          </div>

          <div style="text-align: center; margin: 35px 0 20px;">
            <a href="https://pathwise.edu.ng/dashboard" style="background-color: #20428B; color: #ffffff; font-weight: bold; padding: 14px 32px; border-radius: 12px; text-decoration: none; display: inline-block;">Go To Your Dashboard →</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">© 2026 PathWise System. Delta State University, Abraka.</p>
        </div>
      </div>
    </div>
  `;

  // 1. Try Brevo API first
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await sendViaBrevo({
        toEmail: userEmail,
        toName: userName,
        subject,
        htmlContent,
      });
      if (res && res.success) return res;
    } catch (brevoErr) {
      console.warn('⚠️ [BREVO API FALLBACK] Brevo welcome email error:', brevoErr.message);
    }
  }

  // 2. Fallback to SMTP / Ethereal
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_USER
      ? `"PathWise Team" <${process.env.SMTP_USER}>`
      : '"PathWise Team" <welcome@pathwise.edu.ng>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`✉️ Welcome email dispatched. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Welcome Preview]: ${previewUrl}`);
      return { previewUrl, success: true };
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to dispatch welcome email:', error);
    return { error: error.message };
  }
};

/**
 * Dispatches a 6-digit password reset OTP email to a user.
 */
export const sendPasswordResetEmail = async (userEmail, userName, resetCode) => {
  const subject = `🔑 ${resetCode} is your PathWise password reset code`;
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <div style="background-color: #20428B; padding: 35px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">PathWise Security</h1>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">Delta State University · Academic Advisory</p>
        </div>
        <div style="padding: 35px 30px; line-height: 1.6; font-size: 15px; color: #334155;">
          <p style="margin-top: 0;">Hello <strong>${userName || 'Student'}</strong>,</p>
          <p>We received a request to reset the password for your PathWise student account. Use the 6-digit verification code below to proceed:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #EEF2F9; border: 2px dashed #20428B; border-radius: 14px; padding: 16px 32px; letter-spacing: 10px; font-size: 32px; font-weight: 800; color: #20428B; font-family: monospace;">
              ${resetCode}
            </div>
          </div>

          <div style="background-color: #FEF2F2; border-radius: 12px; padding: 14px 18px; margin: 24px 0; border-left: 4px solid #DC2626;">
            <p style="margin: 0; font-size: 13px; color: #991B1B; font-weight: 600;">⚠️ Security Notice</p>
            <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #B91C1C;">This code is valid for <strong>15 minutes</strong>. Never share this code with anyone. PathWise staff will never ask for your code.</p>
          </div>

          <p style="font-size: 13px; color: #64748B; margin-bottom: 0;">If you did not make this request, you can safely ignore this email. Your account credentials remain secure.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 18px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">© 2026 PathWise · Faculty of Science, Delta State University, Abraka</p>
        </div>
      </div>
    </div>
  `;

  // 1. Try Brevo API first
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await sendViaBrevo({
        toEmail: userEmail,
        toName: userName,
        subject,
        htmlContent,
      });
      if (res && res.success) return res;
    } catch (brevoErr) {
      console.warn('⚠️ [BREVO API FALLBACK] Brevo password reset error:', brevoErr.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP or Ethereal test account
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_USER
      ? `"PathWise Security" <${process.env.SMTP_USER}>`
      : '"PathWise Security" <security@pathwise.edu.ng>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject,
      html: htmlContent,
    });

    console.log(`✉️ Password reset email dispatched via SMTP. Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Reset Preview]: ${previewUrl}`);
      return { previewUrl, success: true, provider: 'ethereal' };
    }
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to dispatch password reset email via SMTP:', error);
    return { error: error.message };
  }
};
