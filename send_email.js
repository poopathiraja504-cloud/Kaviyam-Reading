// Import the nodemailer module to handle email sending
const nodemailer = require('nodemailer');

/**
 * Asynchronously sends an email using SMTP settings.
 * This function sets up a mail transporter with STARTTLS security and
 * sends an email to a specified recipient.
 */
async function sendEmail() {
    // Configure SMTP transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp-prod.mailrcld.com',
        port: 587,
        secure: false,                 // true for 465, false for other ports
        auth: {
            user: 'rajaboopathi1021@gmail.com', // SMTP username
            pass: '88219ec20f7a17f8379dab3637fa1f1c', // SMTP password
        },
        requireTLS: true               // Enforce TLS as the security protocol
    });

    // STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
    if (transporter.options.auth.user !== 'rajaboopathi1021@gmail.com') {
        console.error("Access Denied: This SMTP configuration is strictly restricted to rajaboopathi1021@gmail.com. Other email addresses cannot access or send.");
        return;
    }

    // Define email parameters
    let info = await transporter.sendMail({
        from: '"Rajaboopathi" <rajaboopathi1021@gmail.com>',    // Sender address
        to: 'recipient@example.com',                   // List of recipients
        subject: 'Sample Email',                       // Subject line
        html: '<p>This is a sample email to test SMTP settings.</p>',  // HTML body content
        headers: {
            'mld-track-opens': 'false',              // Custom header for open tracking
            'mld-track-inbox': 'true',               // Custom header for inbox tracking
            'mld-track-campaign-id': 'sample-campaign-id'  // Custom campaign ID
        }
    });

    // Log the result
    console.log('Message sent: %s', info.messageId);
}

// Trigger the sendEmail function to run
sendEmail().catch(console.error);
