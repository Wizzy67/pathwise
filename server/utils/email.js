import nodemailer from 'nodemailer';

/**
 * Dispatches a welcome email to a newly registered user.
 * Falls back to creating a free Ethereal test inbox if no .env SMTP details exist.
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    let transporter;
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (hasSmtpConfig) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('📬 Email transporter configured using Env SMTP credentials.');
    } else {
      console.log('📬 No SMTP credentials found in .env. Creating Ethereal Test Account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`📬 Ethereal account created: ${testAccount.user}`);
    }

    const mailOptions = {
      from: '"PathWise Team" <welcome@pathwise.edu.ng>',
      to: userEmail,
      subject: 'Welcome to PathWise! 🚀 Discover Your Academic Path',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #0056FF, #2277FF); padding: 40px 30px; text-align: center;">
              <span style="font-size: 40px; display: block; margin-bottom: 10px;">🧭</span>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Welcome to PathWise, ${userName}!</h1>
            </div>
            <div style="padding: 40px 30px; line-height: 1.6; font-size: 16px;">
              <p>Hi ${userName},</p>
              <p>We are absolutely thrilled to welcome you to <strong>PathWise</strong> — your intelligent, personalized academic and career advisor customized for Delta State University students.</p>
              
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #0056FF;">
                <p style="margin: 0; font-weight: 700; color: #0f172a; margin-bottom: 5px;">⚠️ Mandatory Career Assessment</p>
                <p style="margin: 0; font-size: 14px; color: #475569;">To unlock personalized course plans, skill gap analyses, and recommendations tailored to your profile, please complete the mandatory <strong>Career Assessment</strong> on your dashboard.</p>
              </div>

              <p>Here is what you can explore with PathWise:</p>
              <ul style="padding-left: 20px; color: #475569; margin-bottom: 30px;">
                <li style="margin-bottom: 10px;"><strong>AI-Powered Matches:</strong> Discover top careers that align perfectly with your personality, academic achievements, and skills.</li>
                <li style="margin-bottom: 10px;"><strong>DELSU Roadmap:</strong> Step-by-step guidance mapping directly to your university curriculum requirements.</li>
                <li style="margin-bottom: 10px;"><strong>AI Chat Advisor:</strong> Get 24/7 answers to academic questions and career directions.</li>
              </ul>

              <div style="text-align: center; margin: 35px 0 20px;">
                <a href="http://localhost:5173/dashboard" style="background-color: #0056FF; color: #ffffff; font-weight: bold; padding: 15px 35px; border-radius: 50px; text-decoration: none; display: inline-block; box-shadow: 0 4px 15px rgba(0, 86, 255, 0.3);">Go To Your Dashboard →</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">© 2026 PathWise System. Delta State University.</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully dispatched. Message ID: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Ethereal Preview URL]: ${previewUrl}`);
      return { previewUrl };
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to dispatch email:', error);
    return { error: error.message };
  }
};
