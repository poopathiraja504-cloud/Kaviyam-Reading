const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure Transporter via Firebase Cloud Functions environment secrets/config
// Configure using: firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="your-email@gmail.com" smtp.pass="your-app-password"
const getTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || functions.config().smtp?.host || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || functions.config().smtp?.port || "587", 10);
  const smtpUser = process.env.SMTP_USER || functions.config().smtp?.user;
  const smtpPass = process.env.SMTP_PASS || functions.config().smtp?.pass;

  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return null;
};

/**
 * Callable HTTPS Cloud Function: sendWelcomeEmail
 * Called from frontend after successful Firebase login.
 * Verifies caller authentication ID token before sending welcome email.
 */
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  // 1. Ensure user is authenticated with Firebase
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;
  const userRecord = await admin.auth().getUser(uid);
  const email = userRecord.email || data.email;
  const displayName = userRecord.displayName || data.displayName || "";

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No email address associated with this Firebase account."
    );
  }

  const subject = "Welcome to Kaviyam Reading";
  const plainTextBody = `Welcome to Kaviyam Reading! 📚\n\nThank you for logging in and continuing your reading journey with us.\n\nWe are happy to have you with us.\n\nHappy Reading!\nKaviyam Reading Team`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Kaviyam Reading</title>
    </head>
    <body style="margin:0; padding:0; background-color:#070f1e; font-family:'Segoe UI', Tahoma, Geneva, sans-serif; color:#f5f5f7;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#070f1e; padding: 20px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#0c1830; border:1px solid #f0c15c; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
              <tr>
                <td align="center" style="padding: 30px 20px 20px; background: linear-gradient(180deg, #122347 0%, #0c1830 100%); border-bottom: 1px solid rgba(240,193,92,0.2);">
                  <h1 style="margin:0; font-size:24px; color:#f0c15c; font-family:Georgia, serif;">
                    📚 Kaviyam Reading
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 25px; line-height: 1.6; color: #e2e8f0; font-size: 15px;">
                  <p style="margin-top:0; font-size:16px; font-weight:600; color:#f0c15c;">
                    Welcome to Kaviyam Reading! 📚
                  </p>
                  <p style="margin: 16px 0;">
                    Thank you for logging in and continuing your reading journey with us.
                  </p>
                  <p style="margin: 16px 0;">
                    We are happy to have you with us.
                  </p>
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0; color: #cbd5e1;">Happy Reading!</p>
                    <p style="margin: 4px 0 0; font-weight: bold; color: #f0c15c;">Kaviyam Reading Team</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 15px; background-color: #070f1e; border-top: 1px solid rgba(240,193,92,0.2); font-size: 11px; color: #64748b;">
                  &copy; Kaviyam Reading • Login Notification
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = getTransporter();

  if (transporter) {
    try {
      const fromAddress = process.env.SMTP_FROM || functions.config().smtp?.from || '"Kaviyam Reading" <noreply@kaviyam.com>';
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: subject,
        text: plainTextBody,
        html: htmlBody,
      });

      console.log(`[Cloud Function] Welcome email dispatched to ${email}:`, info.messageId);
      return { success: true, messageId: info.messageId, email };
    } catch (mailErr) {
      console.error(`[Cloud Function] Error sending email via SMTP to ${email}:`, mailErr);
      throw new functions.https.HttpsError("internal", "Failed to dispatch email via SMTP provider.", mailErr.message);
    }
  } else {
    // If SMTP credentials are not yet defined in environment, log to Firestore / Cloud Logging
    console.log(`[Cloud Function Demo Mode] Welcome email triggered for ${email} (uid: ${uid}). Set SMTP credentials to enable live SMTP delivery.`);
    
    // Store in Firestore audit collection if initialized
    try {
      await admin.firestore().collection("login_emails").add({
        uid,
        email,
        displayName,
        subject,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "logged_demo_mode"
      });
    } catch (dbErr) {
      console.warn("Firestore audit log skipped:", dbErr.message);
    }

    return {
      success: true,
      demoMode: true,
      message: `Welcome email process executed for ${email}. Configure SMTP settings in Cloud Functions config for live dispatch.`,
      email
    };
  }
});
