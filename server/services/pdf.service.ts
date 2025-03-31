import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import { storage } from '../storage';
import { Application, ApplicationStatus } from '@shared/schema';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF concession pass for an approved application
 * @param applicationId The application ID
 * @returns A Buffer containing the generated PDF
 */
export async function generateConcessionPDF(applicationId: number): Promise<Buffer> {
  // Get the application
  const application = await storage.getApplication(applicationId);
  if (!application) {
    throw new Error(`Application ${applicationId} not found`);
  }

  // Only generate PDF for issued applications
  if (application.status !== ApplicationStatus.ISSUED) {
    throw new Error(`Application ${applicationId} is not in ISSUED status`);
  }

  // Get the student, college, and depot details
  const student = await storage.getStudent(application.studentId);
  if (!student) {
    throw new Error(`Student ${application.studentId} not found`);
  }

  const college = await storage.getCollege(application.collegeId);
  if (!college) {
    throw new Error(`College ${application.collegeId} not found`);
  }

  const depot = await storage.getDepot(application.depotId);
  if (!depot) {
    throw new Error(`Depot ${application.depotId} not found`);
  }

  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'KSRTC Student Concession Pass',
      Author: 'KSRTC Online Concession System',
      Subject: 'Student Concession Pass',
      Keywords: 'concession, student, bus, transportation',
      CreationDate: new Date(),
    }
  });

  // Create a buffer to collect the PDF data
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'ksrtc-logo.svg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 80 });
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Title
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('KERALA STATE ROAD TRANSPORT CORPORATION', 150, 50, { align: 'center' });
  
  doc.fontSize(16)
     .text('STUDENT CONCESSION PASS', 150, 80, { align: 'center' });

  doc.moveDown(1);
  
  // Border for the whole document
  doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
     .stroke();

  // Horizontal line below the title
  doc.moveTo(40, 110)
     .lineTo(doc.page.width - 40, 110)
     .stroke();

  // Pass details section
  doc.fontSize(12).font('Helvetica-Bold').text('PASS DETAILS', 50, 120);
  
  // Horizontal line below section title
  doc.moveTo(50, 140)
     .lineTo(doc.page.width - 50, 140)
     .stroke();
  
  doc.font('Helvetica').fontSize(10);
  
  // Pass details in two columns
  const col1 = 60;
  const col2 = 200;
  const col3 = 350;
  const col4 = 450;
  let y = 150;
  
  doc.font('Helvetica-Bold').text('Pass Number:', col1, y);
  doc.font('Helvetica').text(`KSR-${application.id.toString().padStart(8, '0')}`, col2, y);
  
  doc.font('Helvetica-Bold').text('Issue Date:', col3, y);
  doc.font('Helvetica').text(formatDate(application.issuedAt || new Date()), col4, y);
  
  y += 20;
  doc.font('Helvetica-Bold').text('Valid From:', col1, y);
  doc.font('Helvetica').text(formatDate(application.issuedAt || new Date()), col2, y);
  
  doc.font('Helvetica-Bold').text('Valid Until:', col3, y);
  doc.font('Helvetica').text(getExpiryDate(application.issuedAt || new Date()), col4, y);
  
  // Student details section
  y += 40;
  doc.fontSize(12).font('Helvetica-Bold').text('STUDENT DETAILS', 50, y);
  y += 20;
  
  // Horizontal line below section title
  doc.moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .stroke();
  
  y += 10;
  doc.font('Helvetica-Bold').text('Name:', col1, y);
  doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, col2, y);
  
  doc.font('Helvetica-Bold').text('College ID:', col3, y);
  doc.font('Helvetica').text(student.collegeIdNumber, col4, y);
  
  y += 20;
  doc.font('Helvetica-Bold').text('College:', col1, y);
  doc.font('Helvetica').text(college.name, col2, y);
  
  y += 20;
  doc.font('Helvetica-Bold').text('Course:', col1, y);
  doc.font('Helvetica').text(student.course, col2, y);
  
  doc.font('Helvetica-Bold').text('Department:', col3, y);
  doc.font('Helvetica').text(student.department, col4, y);
  
  // Journey details section
  y += 40;
  doc.fontSize(12).font('Helvetica-Bold').text('JOURNEY DETAILS', 50, y);
  y += 20;
  
  // Horizontal line below section title
  doc.moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .stroke();
  
  y += 10;
  doc.font('Helvetica-Bold').text('From:', col1, y);
  doc.font('Helvetica').text(application.startPoint, col2, y);
  
  doc.font('Helvetica-Bold').text('To:', col3, y);
  doc.font('Helvetica').text(application.endPoint, col4, y);
  
  y += 20;
  doc.font('Helvetica-Bold').text('Depot:', col1, y);
  doc.font('Helvetica').text(depot.name, col2, y);
  
  // Calculate fare (simplified implementation)
  const fareAmount = calculateFare(application.startPoint, application.endPoint);
  doc.font('Helvetica-Bold').text('Concession Fare:', col3, y);
  doc.font('Helvetica').text(`₹${fareAmount.toFixed(2)}`, col4, y);
  
  // Terms and conditions
  y += 60;
  doc.fontSize(10).font('Helvetica-Bold').text('TERMS AND CONDITIONS:', 50, y);
  y += 15;
  doc.font('Helvetica').fontSize(8);
  
  const terms = [
    '1. This pass is valid only for the journey and student mentioned above.',
    '2. This pass must be shown to the conductor or ticket inspector when requested.',
    '3. The pass is valid for three months from the date of issue.',
    '4. This pass is non-transferable.',
    '5. Any misuse of this pass will lead to cancellation and further disciplinary action.',
    '6. In case of loss, a duplicate pass can be issued after proper verification.',
    '7. Students must carry their college ID card along with this pass.',
    '8. The pass is valid only on ordinary/express services, not on premium services.'
  ];
  
  terms.forEach(term => {
    doc.text(term, 50, y);
    y += 12;
  });
  
  // Signature section
  y += 20;
  doc.fontSize(10).font('Helvetica');
  
  // Left side - student
  doc.font('Helvetica-Bold').text('Student Signature', 100, y, { width: 100, align: 'center' });
  doc.moveTo(70, y + 50).lineTo(130, y + 50).stroke(); // Line for signature
  
  // Right side - issuing authority
  doc.font('Helvetica-Bold').text('Issuing Authority', 450, y, { width: 100, align: 'center' });
  doc.moveTo(420, y + 50).lineTo(480, y + 50).stroke(); // Line for signature
  
  // Add QR code placeholder or verification information
  y += 70;
  doc.fontSize(8).font('Helvetica').text('This pass can be verified online at www.ksrtc.in/verify', 50, y, { align: 'center' });
  
  // Footer
  doc.fontSize(8)
     .text('Kerala State Road Transport Corporation', 50, doc.page.height - 50, { align: 'center' })
     .text('www.ksrtc.in | 24x7 Helpline: 1800-XXX-XXXX', 50, doc.page.height - 40, { align: 'center' });
  
  // Finalize the PDF
  doc.end();
  
  // Wait for all data and return the buffer
  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(buffers);
      resolve(buffer);
    });
  });
}

/**
 * Updates an application status to 'issued' and generates the concession PDF
 * @param applicationId The application ID to issue
 * @returns The issued application
 */
export async function issueConcessionPass(applicationId: number): Promise<Application | undefined> {
  // Get the application
  const application = await storage.getApplication(applicationId);
  if (!application) {
    throw new Error(`Application ${applicationId} not found`);
  }

  // Check if the application is in PAYMENT_VERIFIED status
  if (application.status !== ApplicationStatus.PAYMENT_VERIFIED) {
    throw new Error(`Application ${applicationId} is not in PAYMENT_VERIFIED status`);
  }

  // Update the application status to ISSUED
  const updatedApplication = await storage.updateApplicationStatus(
    applicationId, 
    ApplicationStatus.ISSUED,
    undefined
  );

  return updatedApplication;
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