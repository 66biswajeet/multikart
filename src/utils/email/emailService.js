import nodemailer from "nodemailer";
import setting from "@/app/api/settings/setting.json";

/**
 * Get email configuration from settings
 * @returns {Object} Email configuration
 */
function getEmailConfig() {
  const emailSettings = setting?.values?.email || {};

  return {
    host: emailSettings.mail_host || process.env.SMTP_HOST,
    port: emailSettings.mail_port || parseInt(process.env.SMTP_PORT) || 587,
    secure: emailSettings.mail_encryption === "ssl", // true for 465, false for other ports
    auth: {
      user: emailSettings.mail_username || process.env.SMTP_USER,
      pass: emailSettings.mail_password || process.env.SMTP_PASS,
    },
    fromName: emailSettings.mail_from_name || "FastKart",
    fromAddress: emailSettings.mail_from_address || process.env.SMTP_FROM,
    mailer: emailSettings.mail_mailer || "smtp",
    encryption: emailSettings.mail_encryption || "tls",
  };
}

/**
 * Create email transporter
 * @returns {Promise<nodemailer.Transporter>}
 */
async function createTransporter() {
  const config = getEmailConfig();

  // Create transporter configuration
  const transporterConfig = {
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  };

  // Add TLS options if encryption is TLS
  if (config.encryption === "tls" && !config.secure) {
    transporterConfig.tls = {
      rejectUnauthorized: false, // For development, set to true in production
    };
  }

  // Create transporter
  const transporter = nodemailer.createTransport(transporterConfig);

  // Verify connection configuration (optional, for testing)
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
  } catch (error) {
    console.error("Email server verification failed:", error);
    // Don't throw error, still allow sending emails
  }

  return transporter;
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} Send result
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const config = getEmailConfig();
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 5-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} Send result
 */
export async function sendPasswordResetEmail(to, otp, userName = "User") {
  const subject = "Password Reset OTP - FastKart";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }
        .otp-box {
          background-color: #ffffff;
          border: 2px dashed #4CAF50;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #4CAF50;
          letter-spacing: 5px;
          font-family: 'Courier New', monospace;
        }
        .content {
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FastKart</div>
          <h2>Password Reset Request</h2>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset your password for your FastKart account. Use the OTP code below to verify your identity:</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>Enter this code on the password reset page to continue.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This OTP is valid for 15 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} FastKart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Send password reset success email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name (optional)
 * @returns {Promise<Object>} Send result
 */
export async function sendPasswordResetSuccessEmail(to, userName = "User") {
  const subject = "Password Reset Successful - FastKart";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 10px;
        }
        .success-box {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FastKart</div>
          <h2>Password Reset Successful</h2>
        </div>
        
        <div class="success-box">
          <div class="success-icon">✓</div>
          <h3 style="margin: 0; color: #155724;">Your password has been successfully reset!</h3>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>Your password has been successfully changed. You can now log in to your FastKart account using your new password.</p>
          
          <div class="warning">
            <strong>🔒 Security Reminder:</strong>
            <p style="margin: 10px 0;">If you didn't make this change, please contact our support team immediately.</p>
          </div>
          
          <p>For your security, we recommend:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Using a strong, unique password</li>
            <li>Not sharing your password with anyone</li>
            <li>Logging out when using shared devices</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} FastKart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
  });
}

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
};
