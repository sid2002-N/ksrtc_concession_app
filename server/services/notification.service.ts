import nodemailer from 'nodemailer';
import twilio from 'twilio';
import cron from 'node-cron';
import { User, Application, ApplicationStatus } from '@shared/schema';
import { storage } from '../storage';

// Environment variables for email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@ksrtc.kerala.gov.in';

// Environment variables for SMS configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize email transporter
let emailTransporter: nodemailer.Transporter | null = null;
if (EMAIL_USER && EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
  console.log('Email service initialized');
} else {
  console.log('Email credentials not provided, email notifications disabled');
}

// Initialize SMS client
let smsClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  smsClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('SMS service initialized');
} else {
  console.log('Twilio credentials not provided, SMS notifications disabled');
}

/**
 * Send an email notification
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailTransporter) {
    console.log('Email transporter not configured');
    return false;
  }

  try {
    await emailTransporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an SMS notification
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!smsClient || !TWILIO_PHONE_NUMBER) {
    console.log('SMS client not configured');
    return false;
  }

  try {
    await smsClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to
    });
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send a notification based on application status change
 */
export async function sendStatusNotification(
  application: Application, 
  user: User
): Promise<void> {
  try {
    const student = await storage.getStudent(application.studentId);
    if (!student) {
      console.error(`Student not found for application ${application.id}`);
      return;
    }

    const college = await storage.getCollege(application.collegeId);
    const depot = await storage.getDepot(application.depotId);

    if (!college || !depot) {
      console.error(`College or depot not found for application ${application.id}`);
      return;
    }

    let subject = '';
    let message = '';
    let phoneNumber = user.phone;

    switch (application.status) {
      case ApplicationStatus.COLLEGE_VERIFIED:
        subject = 'Application Verified by College';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your concession application has been verified by ${college.name}. Your application is now pending approval from KSRTC depot.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      case ApplicationStatus.COLLEGE_REJECTED:
        subject = 'Application Rejected by College';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your concession application has been rejected by ${college.name}.
        
        Reason: ${application.rejectionReason || 'No reason provided'}
        
        Please contact your college office for more information.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      case ApplicationStatus.DEPOT_APPROVED:
        subject = 'Application Approved by KSRTC Depot';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your concession application has been approved by ${depot.name}. Please proceed with the payment to complete the process.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        Amount: Rs. ${calculateFare(application.startPoint, application.endPoint)}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      case ApplicationStatus.DEPOT_REJECTED:
        subject = 'Application Rejected by KSRTC Depot';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your concession application has been rejected by ${depot.name}.
        
        Reason: ${application.rejectionReason || 'No reason provided'}
        
        Please contact the depot for more information.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      case ApplicationStatus.PAYMENT_VERIFIED:
        subject = 'Payment Verified';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your payment for concession application has been verified. Your concession pass will be issued shortly.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      case ApplicationStatus.ISSUED:
        subject = 'Concession Pass Issued';
        message = `Dear ${student.firstName} ${student.lastName},
        
        Your concession pass has been issued. You can collect it from ${depot.name}.
        
        Application ID: ${application.id}
        Route: ${application.startPoint} to ${application.endPoint}
        Valid until: ${getExpiryDate(new Date())}
        
        Thank you,
        KSRTC Online Concession System`;
        break;

      default:
        return; // No notification for other statuses
    }

    // Clean up the message for SMS (remove excessive whitespace)
    const smsMessage = message.replace(/\s+/g, ' ').trim();

    // Send email
    if (user.email) {
      await sendEmail(user.email, subject, message.replace(/\n/g, '<br>'));
    }

    // Send SMS
    if (phoneNumber) {
      const shortMessage = `KSRTC: ${subject}. ${smsMessage.substring(0, 100)}... See email for details.`;
      await sendSMS(phoneNumber, shortMessage);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Helper function to calculate fare based on start and end points
 * This is a simplified implementation - in a real system, this would query a fare database
 */
function calculateFare(startPoint: string, endPoint: string): number {
  // Placeholder - in real implementation, this would use a fare calculation service
  return 500; // Default fare amount
}

/**
 * Helper function to get expiry date (3 months from now)
 */
function getExpiryDate(issueDate: Date): string {
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  return expiryDate.toISOString().split('T')[0];
}

/**
 * Set up scheduled reminders for applications pending action
 */
export function initializeScheduledNotifications(): void {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled application reminders...');
    
    try {
      // Reminder for students to complete payment
      const paymentPendingApps = (await storage.getAllApplications())
        .filter(app => app.status === ApplicationStatus.PAYMENT_PENDING);
      
      for (const app of paymentPendingApps) {
        const student = await storage.getStudent(app.studentId);
        if (!student) continue;
        
        const studentUser = await storage.getUser(student.userId);
        if (!studentUser) continue;
        
        const subject = 'Payment Reminder: KSRTC Concession Application';
        const message = `Dear ${student.firstName} ${student.lastName},
        
        This is a reminder that your concession application (ID: ${app.id}) is pending payment.
        Please complete the payment at your earliest convenience to avoid delays in receiving your concession pass.
        
        Thank you,
        KSRTC Online Concession System`;
        
        if (studentUser.email) {
          await sendEmail(studentUser.email, subject, message.replace(/\n/g, '<br>'));
        }
      }
      
      // Reminder for expired or soon-to-expire passes (could be added in future)
      
    } catch (error) {
      console.error('Error in scheduled notifications:', error);
    }
  });
  
  console.log('Scheduled notifications initialized');
}