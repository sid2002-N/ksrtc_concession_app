import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Application, ApplicationStatus, User, UserType } from '@shared/schema';
import { storage } from '../storage';
import cron from 'node-cron';

// Initialize email transporter
let emailTransporter: nodemailer.Transporter | null = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} else {
  console.log('Email credentials not provided, email notifications disabled');
}

// Initialize Twilio client
let twilioClient: any = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.log('Twilio credentials not provided, SMS notifications disabled');
}

/**
 * Send an email notification
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!emailTransporter) {
    console.log('Email service not configured, skipping email notification');
    return false;
  }

  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'KSRTC Concession System <noreply@ksrtc.in>',
      to,
      subject,
      html
    });
    
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send an SMS notification
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('SMS service not configured, skipping SMS notification');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
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
  // Get relevant user data based on user type
  let student, college, depot;
  
  student = await storage.getStudent(application.studentId);
  if (!student) {
    console.error(`Student not found for application ${application.id}`);
    return;
  }
  
  const studentUser = await storage.getUser(student.userId);
  if (!studentUser) {
    console.error(`User not found for student ${student.id}`);
    return;
  }

  let emailSubject = '';
  let emailBody = '';
  let smsBody = '';

  // Construct notification message based on application status
  switch (application.status) {
    case ApplicationStatus.PENDING:
      // New application submitted
      emailSubject = 'Concession Application Submitted';
      emailBody = `
        <h1>Application Submitted Successfully</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your concession application (Application ID: ${application.id}) has been submitted successfully and is pending verification by your college.</p>
        <p>Journey Details:</p>
        <ul>
          <li>From: ${application.startPoint}</li>
          <li>To: ${application.endPoint}</li>
        </ul>
        <p>You will be notified once your college verifies your application.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession application (ID: ${application.id}) has been submitted and is pending college verification. Check your email for details.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);

      // Notify college
      college = await storage.getCollege(application.collegeId);
      if (college) {
        const collegeUser = await storage.getUser(college.userId || 0);
        if (collegeUser) {
          const collegeEmailSubject = 'New Student Concession Application';
          const collegeEmailBody = `
            <h1>New Student Concession Application</h1>
            <p>Dear ${college.contactPerson},</p>
            <p>A new concession application (ID: ${application.id}) has been submitted by ${student.firstName} ${student.lastName} (ID: ${student.collegeIdNumber}) and is pending your verification.</p>
            <p>Please log in to the KSRTC Concession Portal to review and verify the application.</p>
            <p>Thank you,<br>KSRTC Concession System</p>
          `;
          await sendEmail(collegeUser.email, collegeEmailSubject, collegeEmailBody);
        }
      }
      break;
      
    case ApplicationStatus.COLLEGE_VERIFIED:
      // College verified application
      emailSubject = 'Concession Application Verified by College';
      emailBody = `
        <h1>Application Verified by College</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your concession application (Application ID: ${application.id}) has been verified by your college.</p>
        <p>Your application has been forwarded to the KSRTC depot for approval.</p>
        <p>You will be notified once the depot reviews your application.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession application (ID: ${application.id}) has been verified by your college and forwarded to KSRTC depot for approval.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);

      // Notify depot
      depot = await storage.getDepot(application.depotId);
      if (depot) {
        const depotUser = await storage.getUser(depot.userId || 0);
        if (depotUser) {
          const depotEmailSubject = 'New Verified Concession Application';
          const depotEmailBody = `
            <h1>New Verified Concession Application</h1>
            <p>Dear ${depot.contactPerson},</p>
            <p>A new concession application (ID: ${application.id}) verified by the college is awaiting your approval.</p>
            <p>Student: ${student.firstName} ${student.lastName}</p>
            <p>Journey: ${application.startPoint} to ${application.endPoint}</p>
            <p>Please log in to the KSRTC Concession Portal to review and process the application.</p>
            <p>Thank you,<br>KSRTC Concession System</p>
          `;
          await sendEmail(depotUser.email, depotEmailSubject, depotEmailBody);
        }
      }
      break;
      
    case ApplicationStatus.COLLEGE_REJECTED:
      // College rejected application
      emailSubject = 'Concession Application Rejected by College';
      emailBody = `
        <h1>Application Rejected by College</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>We regret to inform you that your concession application (Application ID: ${application.id}) has been rejected by your college.</p>
        <p>Reason for rejection: ${application.rejectionReason || "No specific reason provided"}</p>
        <p>Please contact your college administration for further clarification.</p>
        <p>You may submit a new application after resolving the issues.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession application (ID: ${application.id}) has been rejected by your college. Check your email for details.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);
      break;
      
    case ApplicationStatus.DEPOT_APPROVED:
      // Depot approved application
      emailSubject = 'Concession Application Approved - Payment Required';
      emailBody = `
        <h1>Application Approved - Payment Required</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your concession application (Application ID: ${application.id}) has been approved by the KSRTC depot.</p>
        <p>Journey Details:</p>
        <ul>
          <li>From: ${application.startPoint}</li>
          <li>To: ${application.endPoint}</li>
          <li>Fare Amount: ₹${calculateFare(application.startPoint, application.endPoint).toFixed(2)}</li>
        </ul>
        <p>Please log in to the portal to make the payment for your concession pass.</p>
        <p>Note: Your concession pass will be issued only after successful payment verification.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession application (ID: ${application.id}) is approved! Please log in to make the payment (₹${calculateFare(application.startPoint, application.endPoint).toFixed(2)}).`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);
      break;
      
    case ApplicationStatus.DEPOT_REJECTED:
      // Depot rejected application
      emailSubject = 'Concession Application Rejected by KSRTC Depot';
      emailBody = `
        <h1>Application Rejected by KSRTC Depot</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>We regret to inform you that your concession application (Application ID: ${application.id}) has been rejected by the KSRTC depot.</p>
        <p>Reason for rejection: ${application.rejectionReason || "No specific reason provided"}</p>
        <p>If you have any questions, please contact the KSRTC depot directly.</p>
        <p>You may submit a new application after resolving the issues.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession application (ID: ${application.id}) has been rejected by the KSRTC depot. Check your email for details.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);
      break;
      
    case ApplicationStatus.PAYMENT_PENDING:
      // Student submitted payment
      emailSubject = 'Payment Received - Verification Pending';
      emailBody = `
        <h1>Payment Received - Verification Pending</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>We have received your payment for concession application (Application ID: ${application.id}).</p>
        <p>Payment Details:</p>
        <ul>
          <li>Transaction ID: ${application.paymentDetails?.transactionId || "N/A"}</li>
          <li>Amount: ₹${application.paymentDetails?.amount.toFixed(2) || "0.00"}</li>
          <li>Date: ${application.paymentDetails?.transactionDate || "N/A"}</li>
        </ul>
        <p>Your payment is currently being verified. You will be notified once your concession pass is issued.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your payment for concession application (ID: ${application.id}) has been received and is pending verification.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);

      // Notify depot
      depot = await storage.getDepot(application.depotId);
      if (depot) {
        const depotUser = await storage.getUser(depot.userId || 0);
        if (depotUser) {
          const depotEmailSubject = 'Payment Submitted for Concession Application';
          const depotEmailBody = `
            <h1>Payment Submitted for Concession Application</h1>
            <p>Dear ${depot.contactPerson},</p>
            <p>A payment has been submitted for concession application (ID: ${application.id}).</p>
            <p>Student: ${student.firstName} ${student.lastName}</p>
            <p>Payment Details:</p>
            <ul>
              <li>Transaction ID: ${application.paymentDetails?.transactionId || "N/A"}</li>
              <li>Amount: ₹${application.paymentDetails?.amount.toFixed(2) || "0.00"}</li>
              <li>Date: ${application.paymentDetails?.transactionDate || "N/A"}</li>
            </ul>
            <p>Please verify the payment details and issue the concession pass.</p>
            <p>Thank you,<br>KSRTC Concession System</p>
          `;
          await sendEmail(depotUser.email, depotEmailSubject, depotEmailBody);
        }
      }
      break;
      
    case ApplicationStatus.PAYMENT_VERIFIED:
      // Payment verified
      emailSubject = 'Payment Verified - Pass Being Processed';
      emailBody = `
        <h1>Payment Verified - Pass Being Processed</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your payment for concession application (Application ID: ${application.id}) has been verified.</p>
        <p>Your concession pass is now being processed and will be issued shortly.</p>
        <p>You will receive a notification once your pass is ready for download.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your payment for concession application (ID: ${application.id}) is verified. Your pass is being processed and will be available soon.`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);
      break;
      
    case ApplicationStatus.ISSUED:
      // Pass issued
      emailSubject = 'Concession Pass Issued - Ready for Download';
      emailBody = `
        <h1>Concession Pass Issued - Ready for Download</h1>
        <p>Dear ${student.firstName} ${student.lastName},</p>
        <p>Your concession pass for application (ID: ${application.id}) has been issued and is ready for download.</p>
        <p>Pass Details:</p>
        <ul>
          <li>Pass Number: KSR-${application.id.toString().padStart(8, '0')}</li>
          <li>Journey: ${application.startPoint} to ${application.endPoint}</li>
          <li>Valid From: ${formatDate(application.issuedAt || new Date())}</li>
          <li>Valid Until: ${getExpiryDate(application.issuedAt || new Date())}</li>
        </ul>
        <p>Please log in to the portal to download your concession pass.</p>
        <p>Note: You must carry this pass along with your college ID card while traveling.</p>
        <p>Thank you,<br>KSRTC Concession System</p>
      `;
      smsBody = `KSRTC: Your concession pass (ID: ${application.id}) has been issued! Please log in to download your pass. Valid until: ${getExpiryDate(application.issuedAt || new Date())}`;
      
      // Send to student
      await sendEmail(studentUser.email, emailSubject, emailBody);
      await sendSMS(studentUser.phone, smsBody);
      break;

    default:
      // Unhandled status
      console.log(`No notification configured for status: ${application.status}`);
      return;
  }
}

/**
 * Helper function to calculate fare based on start and end points
 * This is a simplified implementation - in a real system, this would query a fare database
 */
function calculateFare(startPoint: string, endPoint: string): number {
  // This is a simplified calculation
  const baseRate = 2.5; // Base rate per kilometer in Rupees
  const distanceMap: Record<string, Record<string, number>> = {
    'Thrissur': {
      'Ernakulam': 75,
      'Kozhikode': 150,
      'Thiruvananthapuram': 280,
      'Palakkad': 45,
      'Kottayam': 130
    },
    'Ernakulam': {
      'Thrissur': 75,
      'Kozhikode': 220,
      'Thiruvananthapuram': 210,
      'Palakkad': 120,
      'Kottayam': 60
    },
    // Add more cities and distances as needed
  };

  // Default distance if not in our map
  let distance = 50; // 50 km default

  // Check if we have the distance in our map
  if (distanceMap[startPoint] && distanceMap[startPoint][endPoint]) {
    distance = distanceMap[startPoint][endPoint];
  } else if (distanceMap[endPoint] && distanceMap[endPoint][startPoint]) {
    // Check the reverse direction
    distance = distanceMap[endPoint][startPoint];
  }

  // Calculate fare with 50% student discount
  const regularFare = distance * baseRate;
  const discountedFare = regularFare * 0.5; // 50% discount for students
  
  return discountedFare;
}

/**
 * Helper function to get expiry date (3 months from now)
 */
function getExpiryDate(issueDate: Date): string {
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  
  return formatDate(expiryDate);
}

/**
 * Helper function to format a date string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Set up scheduled reminders for applications pending action
 */
export function initializeScheduledNotifications(): void {
  // Daily at 9 AM, send reminders for pending applications
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled notification check...');
    
    try {
      // Get all applications
      const allApplications = await storage.getAllApplications();
      
      // Get pending college verifications (older than 2 days)
      const pendingCollegeVerifications = allApplications.filter(app => 
        app.status === ApplicationStatus.PENDING &&
        new Date(app.applicationDate).getTime() < Date.now() - (2 * 24 * 60 * 60 * 1000)
      );
      
      for (const app of pendingCollegeVerifications) {
        const college = await storage.getCollege(app.collegeId);
        if (college && college.userId) {
          const collegeUser = await storage.getUser(college.userId);
          if (collegeUser) {
            const student = await storage.getStudent(app.studentId);
            if (student) {
              const subject = 'Reminder: Pending Concession Application Verification';
              const html = `
                <h1>Reminder: Action Required</h1>
                <p>Dear ${college.contactPerson},</p>
                <p>This is a reminder that the concession application (ID: ${app.id}) submitted by ${student.firstName} ${student.lastName} is awaiting your verification.</p>
                <p>Please log in to the KSRTC Concession Portal to review and verify the application.</p>
                <p>Thank you,<br>KSRTC Concession System</p>
              `;
              await sendEmail(collegeUser.email, subject, html);
            }
          }
        }
      }
      
      // Get pending depot approvals (older than 2 days)
      const pendingDepotApprovals = allApplications.filter(app => 
        app.status === ApplicationStatus.COLLEGE_VERIFIED &&
        app.collegeVerifiedAt &&
        new Date(app.collegeVerifiedAt).getTime() < Date.now() - (2 * 24 * 60 * 60 * 1000)
      );
      
      for (const app of pendingDepotApprovals) {
        const depot = await storage.getDepot(app.depotId);
        if (depot && depot.userId) {
          const depotUser = await storage.getUser(depot.userId);
          if (depotUser) {
            const student = await storage.getStudent(app.studentId);
            if (student) {
              const subject = 'Reminder: Pending Concession Application Approval';
              const html = `
                <h1>Reminder: Action Required</h1>
                <p>Dear ${depot.contactPerson},</p>
                <p>This is a reminder that the concession application (ID: ${app.id}) for ${student.firstName} ${student.lastName} is awaiting your approval.</p>
                <p>The application has been verified by the college and requires your action.</p>
                <p>Please log in to the KSRTC Concession Portal to process the application.</p>
                <p>Thank you,<br>KSRTC Concession System</p>
              `;
              await sendEmail(depotUser.email, subject, html);
            }
          }
        }
      }
      
      // Get pending payments (older than 3 days)
      const pendingPayments = allApplications.filter(app => 
        app.status === ApplicationStatus.DEPOT_APPROVED &&
        app.depotApprovedAt &&
        new Date(app.depotApprovedAt).getTime() < Date.now() - (3 * 24 * 60 * 60 * 1000)
      );
      
      for (const app of pendingPayments) {
        const student = await storage.getStudent(app.studentId);
        if (student) {
          const studentUser = await storage.getUser(student.userId);
          if (studentUser) {
            const subject = 'Reminder: Payment Required for Concession Pass';
            const html = `
              <h1>Reminder: Payment Required</h1>
              <p>Dear ${student.firstName} ${student.lastName},</p>
              <p>This is a reminder that your approved concession application (ID: ${app.id}) is awaiting payment.</p>
              <p>Please log in to the portal to complete the payment process.</p>
              <p>Journey Details:</p>
              <ul>
                <li>From: ${app.startPoint}</li>
                <li>To: ${app.endPoint}</li>
                <li>Fare Amount: ₹${calculateFare(app.startPoint, app.endPoint).toFixed(2)}</li>
              </ul>
              <p>Note: Your concession pass will be issued only after successful payment verification.</p>
              <p>Thank you,<br>KSRTC Concession System</p>
            `;
            const sms = `KSRTC Reminder: Your concession application (ID: ${app.id}) is waiting for payment (₹${calculateFare(app.startPoint, app.endPoint).toFixed(2)}). Log in to complete the process.`;
            
            await sendEmail(studentUser.email, subject, html);
            await sendSMS(studentUser.phone, sms);
          }
        }
      }
      
      // Get pending payment verifications (older than 1 day)
      const pendingPaymentVerifications = allApplications.filter(app => 
        app.status === ApplicationStatus.PAYMENT_PENDING &&
        app.paymentDetails?.transactionDate &&
        new Date(app.paymentDetails.transactionDate).getTime() < Date.now() - (1 * 24 * 60 * 60 * 1000)
      );
      
      for (const app of pendingPaymentVerifications) {
        const depot = await storage.getDepot(app.depotId);
        if (depot && depot.userId) {
          const depotUser = await storage.getUser(depot.userId);
          if (depotUser) {
            const student = await storage.getStudent(app.studentId);
            if (student) {
              const subject = 'Reminder: Payment Verification Pending';
              const html = `
                <h1>Reminder: Payment Verification Pending</h1>
                <p>Dear ${depot.contactPerson},</p>
                <p>This is a reminder that the payment for concession application (ID: ${app.id}) submitted by ${student.firstName} ${student.lastName} is awaiting your verification.</p>
                <p>Payment Details:</p>
                <ul>
                  <li>Transaction ID: ${app.paymentDetails?.transactionId || "N/A"}</li>
                  <li>Amount: ₹${app.paymentDetails?.amount.toFixed(2) || "0.00"}</li>
                  <li>Date: ${app.paymentDetails?.transactionDate || "N/A"}</li>
                </ul>
                <p>Please log in to the KSRTC Concession Portal to verify the payment and issue the concession pass.</p>
                <p>Thank you,<br>KSRTC Concession System</p>
              `;
              await sendEmail(depotUser.email, subject, html);
            }
          }
        }
      }
      
      console.log('Scheduled notification check completed');
    } catch (error) {
      console.error('Error in scheduled notifications:', error);
    }
  });
  
  console.log('Scheduled notifications initialized');
}