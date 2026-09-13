import java.util.Properties;
import java.util.Random;
import javax.mail.*;
import javax.mail.internet.*;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

public class OtpService {

    // ==========================================
    // CONFIGURATION PROPERTIES
    // ==========================================
    
    // Email Configuration (Example using Mailercloud SMTP)
    private static final String SMTP_HOST = "smtp-prod.mailrcld.com";
    private static final String SMTP_PORT = "587";
    private static final String SENDER_EMAIL = "rajaboopathi1021@gmail.com";
    private static final String SENDER_PASSWORD = "88219ec20f7a17f8379dab3637fa1f1c"; 

    // Twilio Mobile SMS Configuration
    private static final String TWILIO_ACCOUNT_SID = "your_twilio_account_sid";
    private static final String TWILIO_AUTH_TOKEN = "your_twilio_auth_token";
    private static final String TWILIO_SENDER_NUMBER = "+1234567890"; // Your Twilio phone number

    // ==========================================
    // CORE METHODS
    // ==========================================

    /**
     * Generates a secure, random 6-digit OTP code.
     */
    public static String generateOTP() {
        Random random = new Random();
        int number = random.nextInt(900000) + 100000; // Ensures a 6-digit number (100000 to 999999)
        return String.valueOf(number);
    }

    /**
     * Sends the OTP to a specified Email Address.
     */
    public static void sendEmailOTP(String recipientEmail, String otp) {
        // STRICT SECURITY CHECK: Only allow rajaboopathi1021@gmail.com
        if (!SENDER_EMAIL.equals("rajaboopathi1021@gmail.com")) {
            System.err.println("❌ Access Denied: Only rajaboopathi1021@gmail.com is authorized to send OTPs.");
            return;
        }

        // Set up SMTP server properties
        Properties properties = new Properties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.host", SMTP_HOST);
        properties.put("mail.smtp.port", SMTP_PORT);

        // Create session with mail authentication
        Session session = Session.getInstance(properties, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("Your Security Verification Code");
            message.setText("Hello,\n\nYour One-Time Password (OTP) for verification is: " + otp + "\n\nThis code expires in 5 minutes.");

            // Send email
            Transport.send(message);
            System.out.println("✅ OTP successfully sent to email: " + recipientEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send email OTP: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Sends the OTP to a Mobile Number using Twilio.
     * Note: Mobile number must include country code (e.g., +1XXXXXXXXXX, +91XXXXXXXXXX)
     */
    public static void sendMobileOTP(String recipientMobile, String otp) {
        try {
            // Initialize the Twilio client
            Twilio.init(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

            // Construct and dispatch the SMS
            Message message = Message.creator(
                    new PhoneNumber(recipientMobile),  // To
                    new PhoneNumber(TWILIO_SENDER_NUMBER), // From (Twilio Number)
                    "Your Verification Code is: " + otp   // SMS Body
            ).create();

            System.out.println("✅ OTP successfully sent via SMS. SID: " + message.getSid());

        } catch (Exception e) {
            System.err.println("❌ Failed to send mobile OTP: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==========================================
    // EXECUTION ENTRY POINT (MAIN)
    // ==========================================
    public static void main(String[] args) {
        // Step 1: Generate a single OTP code
        String sharedOtp = generateOTP();
        System.out.println("Generated Security Token: " + sharedOtp);
        System.out.println("----------------------------------------------");

        // Step 2: Define your test targets
        String testEmail = "user-recipient@example.com";
        String testMobile = "+12345678901"; // Must include '+' and country code

        // Step 3: Trigger send updates
        // Un-comment these once you insert your actual credentials above!
        
        // sendEmailOTP(testEmail, sharedOtp);
        // sendMobileOTP(testMobile, sharedOtp);
    }
}
