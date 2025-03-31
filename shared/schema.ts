import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types enumeration
export enum UserType {
  STUDENT = "student",
  COLLEGE = "college",
  DEPOT = "depot"
}

// Application status enumeration
export enum ApplicationStatus {
  PENDING = "pending",
  COLLEGE_VERIFIED = "college_verified",
  COLLEGE_REJECTED = "college_rejected",
  DEPOT_APPROVED = "depot_approved",
  DEPOT_REJECTED = "depot_rejected",
  PAYMENT_PENDING = "payment_pending",
  PAYMENT_VERIFIED = "payment_verified",
  ISSUED = "issued"
}

// Define users table with discriminator field for user type
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  userType: text("user_type").notNull().$type<UserType>(),
  phone: text("phone").notNull(),
  collegeId: integer("college_id"),
  depotId: integer("depot_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define students table for student-specific information
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  collegeIdNumber: text("college_id_number").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  altPhone: text("alt_phone"),
  address: text("address").notNull(),
  course: text("course").notNull(),
  department: text("department").notNull(),
  semester: text("semester").notNull(),
  collegeId: integer("college_id").notNull(),
  photoUrl: text("photo_url"),
  // Document verification
  idCardUrl: text("id_card_url"),
  addressProofUrl: text("address_proof_url"),
  documentsVerified: boolean("documents_verified").default(false),
  verificationNotes: text("verification_notes"),
});

// Define colleges table
export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  district: text("district").notNull(),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  userId: integer("user_id"),
});

// Define depots table
export const depots = pgTable("depots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  userId: integer("user_id"),
});

// Define applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull().$type<ApplicationStatus>().default(ApplicationStatus.PENDING),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  collegeId: integer("college_id").notNull(),
  depotId: integer("depot_id").notNull(),
  rejectionReason: text("rejection_reason"),
  collegeVerifiedAt: timestamp("college_verified_at"),
  depotApprovedAt: timestamp("depot_approved_at"),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  isRenewal: boolean("is_renewal").default(false).notNull(),
  paymentDetails: json("payment_details").$type<PaymentDetails>(),
  paymentVerifiedAt: timestamp("payment_verified_at"),
  issuedAt: timestamp("issued_at"),
});

// Create schemas for insertion and types
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertCollegeSchema = createInsertSchema(colleges).omit({ id: true });
export const insertDepotSchema = createInsertSchema(depots).omit({ id: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ 
  id: true, 
  applicationDate: true, 
  collegeVerifiedAt: true, 
  depotApprovedAt: true, 
  paymentVerifiedAt: true, 
  issuedAt: true 
});

// Payment details type
export type PaymentDetails = {
  transactionId: string;
  transactionDate: string;
  accountHolder: string;
  amount: number;
  paymentMethod: string;
};

// Student registration schema
export const studentRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  collegeIdNumber: z.string().min(1, "College ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  altPhone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  course: z.string().min(1, "Course is required"),
  department: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
  collegeId: z.number().min(1, "College is required"),
  photoUrl: z.string().optional(),
  idCardUrl: z.string().optional(),
  addressProofUrl: z.string().optional(),
});

// Payment submission schema
export const paymentSubmissionSchema = z.object({
  applicationId: z.number(),
  transactionId: z.string().min(1, "Transaction ID is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  amount: z.number().min(1, "Amount is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

// Document upload schema
export const documentUploadSchema = z.object({
  documentType: z.enum(["idCard", "addressProof", "photo"]),
  documentUrl: z.string().min(1, "Document URL is required"),
});

// Document verification schema
export const documentVerificationSchema = z.object({
  documentsVerified: z.boolean(),
  verificationNotes: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type InsertDepot = z.infer<typeof insertDepotSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type Depot = typeof depots.$inferSelect;
export type Application = typeof applications.$inferSelect;

export type StudentRegistration = z.infer<typeof studentRegistrationSchema>;
export type PaymentSubmission = z.infer<typeof paymentSubmissionSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type DocumentVerification = z.infer<typeof documentVerificationSchema>;
