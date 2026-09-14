const nodemailer = require('nodemailer');

/**
 * CommonJS version for Mailercloud SMTP email sending.
 */
async function sendEmail() {
    const smtpUser = 'rajaboopathi1021@gmail.com';
    const smtpPass = '88219ec20f7a17f8379dab3637fa1f1c';

    // STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
    if (smtpUser !== 'rajaboopathi1021@gmail.com') {
        console.error("Access Denied: This SMTP configuration is strictly restricted to rajaboopathi1021@gmail.com.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp-prod.mailrcld.com',
        port: 587,
        secure: false,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        requireTLS: true
    });

    const info = await transporter.sendMail({
        from: '"Rajaboopathi" <rajaboopathi1021@gmail.com>',
        to: 'recipient@example.com',
        subject: 'Sample Email',
        html: '<p>This is a sample email to test SMTP settings.</p>',
        headers: {
            'mld-track-opens': 'false',
            'mld-track-inbox': 'true',
            'mld-track-campaign-id': 'sample-campaign-id'
        }
    });

    console.log('Message sent: %s', info.messageId);
}

sendEmail().catch(console.error);
