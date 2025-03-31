import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import BlobStream from 'blob-stream';
import { Application, ApplicationStatus } from '@shared/schema';
import { storage } from '../storage';

/**
 * Generates a PDF concession pass for an approved application
 * @param applicationId The application ID
 * @returns A Buffer containing the generated PDF
 */
export async function generateConcessionPDF(applicationId: number): Promise<Buffer> {
  // Get application details
  const application = await storage.getApplication(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  if (application.status !== ApplicationStatus.ISSUED) {
    throw new Error('Concession pass can only be generated for issued applications');
  }
  
  // Get student details
  const student = await storage.getStudent(application.studentId);
  if (!student) {
    throw new Error('Student details not found');
  }
  
  // Get college details
  const college = await storage.getCollege(application.collegeId);
  if (!college) {
    throw new Error('College details not found');
  }
  
  // Get depot details
  const depot = await storage.getDepot(application.depotId);
  if (!depot) {
    throw new Error('Depot details not found');
  }

  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `KSRTC Student Concession Pass #${applicationId}`,
      Author: 'Kerala State Road Transport Corporation',
      Subject: 'Student Concession Pass',
      Keywords: 'KSRTC, student, concession, pass',
      CreationDate: new Date(),
    }
  });
  
  // Create a buffer to store PDF data
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  
  // Logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'ksrtc-logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 80 });
    }
  } catch (error) {
    console.error('Error loading logo:', error);
    // Continue without logo
  }

  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('KERALA STATE ROAD TRANSPORT CORPORATION', 140, 65, { align: 'center' });
  
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('STUDENT CONCESSION PASS', 140, 85, { align: 'center' });
  
  // Add border to page
  doc
    .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .stroke();
  
  // Horizontal line under title
  doc
    .moveTo(50, 110)
    .lineTo(doc.page.width - 50, 110)
    .stroke();
  
  // Pass details
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('PASS DETAILS', 50, 130);
  
  doc.font('Helvetica').fontSize(11);
  
  // Create a grid layout
  const y = 155;
  const col1 = 50;
  const col2 = 200;
  const col3 = 350;
  const col4 = 500;
  const rowHeight = 25;
  
  // First column (left)
  doc.font('Helvetica-Bold').text('Pass Number:', col1, y);
  doc.font('Helvetica').text(`${applicationId}`, col2, y);
  
  doc.font('Helvetica-Bold').text('Issue Date:', col1, y + rowHeight);
  doc.font('Helvetica').text(application.issuedAt ? new Date(application.issuedAt).toLocaleDateString() : 'Not issued', col2, y + rowHeight);
  
  doc.font('Helvetica-Bold').text('Valid Until:', col1, y + 2 * rowHeight);
  const validUntil = application.issuedAt ? 
    new Date(new Date(application.issuedAt).setMonth(new Date(application.issuedAt).getMonth() + 3)) : 
    new Date();
  doc.font('Helvetica').text(validUntil.toLocaleDateString(), col2, y + 2 * rowHeight);
  
  doc.font('Helvetica-Bold').text('Depot:', col1, y + 3 * rowHeight);
  doc.font('Helvetica').text(depot.name, col2, y + 3 * rowHeight);
  
  // Student details
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('STUDENT DETAILS', 50, y + 5 * rowHeight);
  
  doc.font('Helvetica').fontSize(11);
  
  doc.font('Helvetica-Bold').text('Name:', col1, y + 6 * rowHeight);
  doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, col2, y + 6 * rowHeight);
  
  doc.font('Helvetica-Bold').text('College ID:', col1, y + 7 * rowHeight);
  doc.font('Helvetica').text(student.collegeIdNumber, col2, y + 7 * rowHeight);
  
  doc.font('Helvetica-Bold').text('Course:', col1, y + 8 * rowHeight);
  doc.font('Helvetica').text(`${student.course} - ${student.department}`, col2, y + 8 * rowHeight);
  
  doc.font('Helvetica-Bold').text('College:', col1, y + 9 * rowHeight);
  doc.font('Helvetica').text(college.name, col2, y + 9 * rowHeight);
  
  // Route details
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('ROUTE DETAILS', 50, y + 11 * rowHeight);
  
  doc.font('Helvetica').fontSize(11);
  
  doc.font('Helvetica-Bold').text('From:', col1, y + 12 * rowHeight);
  doc.font('Helvetica').text(application.startPoint, col2, y + 12 * rowHeight);
  
  doc.font('Helvetica-Bold').text('To:', col1, y + 13 * rowHeight);
  doc.font('Helvetica').text(application.endPoint, col2, y + 13 * rowHeight);
  
  // Signature section
  const signatureY = y + 16 * rowHeight;
  doc
    .moveTo(col1, signatureY)
    .lineTo(col2 - 50, signatureY)
    .stroke();
  
  doc
    .moveTo(col3, signatureY)
    .lineTo(col4 - 50, signatureY)
    .stroke();
  
  doc
    .fontSize(10)
    .text('Student Signature', col1, signatureY + 5)
    .text('Authorized Signature', col3, signatureY + 5);
  
  // Terms and conditions
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('TERMS AND CONDITIONS', 50, signatureY + 30);
  
  doc
    .font('Helvetica')
    .fontSize(8)
    .list([
      'Valid only with student ID and original receipt of payment',
      'This concession is valid for 3 months from the date of issue',
      'Applicable only on specified route and designated KSRTC buses',
      'Not transferable to any other person',
      'Concession holder must produce this pass on demand by authorized personnel',
      'KSRTC reserves the right to cancel this concession in case of misuse',
      'Lost passes can be replaced subject to verification and administrative fee'
    ], 50, signatureY + 45, { bulletRadius: 2, textIndent: 10 });
  
  // Footer
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text(
      'This is a computer-generated document and does not require physical signature. For verification, contact the Depot Manager.', 
      50, 
      doc.page.height - 80, 
      { align: 'center' }
    );
  
  // QR code space (mock placeholder)
  doc
    .rect(450, 130, 100, 100)
    .stroke();
  
  doc.fontSize(8).text('QR Verification', 450, 235, { align: 'center' });
  
  // Finish the PDF
  doc.end();
  
  // Return as Promise with buffer
  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

/**
 * Updates an application status to 'issued' and generates the concession PDF
 * @param applicationId The application ID to issue
 * @returns The issued application
 */
export async function issueConcessionPass(applicationId: number): Promise<Application | undefined> {
  // Get application 
  const application = await storage.getApplication(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  // Validate application status
  if (application.status !== ApplicationStatus.PAYMENT_VERIFIED) {
    throw new Error('Only payment verified applications can be issued');
  }
  
  // Update application status to ISSUED
  const updatedApplication = await storage.updateApplicationStatus(
    applicationId,
    ApplicationStatus.ISSUED
  );
  
  return updatedApplication;
}