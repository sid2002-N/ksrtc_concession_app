import { 
  applications, colleges, depots, students, users, 
  ApplicationStatus, UserType 
} from "@shared/schema";
import type { 
  User, InsertUser, 
  Student, InsertStudent, 
  College, InsertCollege, 
  Depot, InsertDepot, 
  Application, InsertApplication,
  PaymentDetails,
  DocumentUpload, DocumentVerification
} from "@shared/schema";
import { MongoDBStorage } from "./db/MongoDBStorage";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./auth";

const MemoryStore = createMemoryStore(session);

// Define storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentDocument(studentId: number, documentType: string, documentUrl: string): Promise<Student | undefined>;
  verifyStudentDocuments(studentId: number, verified: boolean, notes?: string): Promise<Student | undefined>;
  
  // College operations
  getCollege(id: number): Promise<College | undefined>;
  getAllColleges(): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Depot operations
  getDepot(id: number): Promise<Depot | undefined>;
  getAllDepots(): Promise<Depot[]>;
  createDepot(depot: InsertDepot): Promise<Depot>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByStudentId(studentId: number): Promise<Application[]>;
  getApplicationsByCollegeId(collegeId: number, status?: ApplicationStatus): Promise<Application[]>;
  getApplicationsByDepotId(depotId: number, status?: ApplicationStatus): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: ApplicationStatus, reason?: string): Promise<Application | undefined>;
  updateApplicationPayment(id: number, paymentDetails: PaymentDetails): Promise<Application | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private colleges: Map<number, College>;
  private depots: Map<number, Depot>;
  private applications: Map<number, Application>;
  
  sessionStore: session.Store;
  
  currentUserId: number;
  currentStudentId: number;
  currentCollegeId: number;
  currentDepotId: number;
  currentApplicationId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.colleges = new Map();
    this.depots = new Map();
    this.applications = new Map();
    
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentCollegeId = 1;
    this.currentDepotId = 1;
    this.currentApplicationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some sample colleges and depots
    this.initializeData();
  }
  
  // Initialize sample data
  private initializeData() {
    // Add sample colleges
    const colleges: InsertCollege[] = [
      {
        name: "Govt. Engineering College, Thrissur",
        address: "Ramavarmapuram, Thrissur, Kerala 680009",
        district: "Thrissur",
        contactPerson: "Dr. Sunil P.H.",
        phone: "0487-2334144",
        email: "principal@gectcr.ac.in"
      },
      {
        name: "TKM College of Engineering",
        address: "Kollam, Kerala 691005",
        district: "Kollam",
        contactPerson: "Dr. T A Shahul Hameed",
        phone: "0474-2712022",
        email: "principal@tkmce.ac.in"
      },
      {
        name: "College of Engineering, Trivandrum",
        address: "Thiruvananthapuram, Kerala 695016",
        district: "Thiruvananthapuram",
        contactPerson: "Dr. Jiji C.V.",
        phone: "0471-2515555",
        email: "principal@cet.ac.in"
      }
    ];
    
    // Add sample depots
    const depots: InsertDepot[] = [
      {
        name: "Thrissur Depot",
        location: "Thrissur",
        address: "KSRTC Bus Stand, Shaktan Thampuran Nagar, Thrissur",
        contactPerson: "Ajith Kumar",
        phone: "0487-2423144",
        email: "depotmls@ksrtc.kerala.gov.in"
      },
      {
        name: "Kollam Depot",
        location: "Kollam",
        address: "KSRTC Bus Stand, Kollam",
        contactPerson: "Suresh Kumar",
        phone: "0474-2752022",
        email: "depotklm@ksrtc.kerala.gov.in"
      },
      {
        name: "Trivandrum Central Depot",
        location: "Trivandrum",
        address: "KSRTC Bus Stand, Thampanoor, Thiruvananthapuram",
        contactPerson: "Vishnu Prasad",
        phone: "0471-2323555",
        email: "depottvc@ksrtc.kerala.gov.in"
      }
    ];
    
    // Initialize colleges
    let createdColleges = colleges.map(college => this.createCollege(college));
    
    // Initialize depots
    let createdDepots = depots.map(depot => this.createDepot(depot));
    
    // The following hashed passwords are for 'password123'
    // We're using Promise.all with an IIFE to await promises in constructor
    (async () => {
      try {
        // Add sample users
        // Get a fresh hash for 'password123' to ensure it works with current hash settings
        const hashedPassword = await hashPassword("password123");
        console.log("Created fresh hash for sample users");
        
        // Sample students
        const studentUser = await this.createUser({
          username: "student1",
          password: hashedPassword,
          email: "student1@example.com",
          phone: "9876543210",
          userType: UserType.STUDENT,
          collegeId: 1,
          depotId: null
        });
        
        await this.createStudent({
          userId: studentUser.id,
          firstName: "Arjun",
          lastName: "Kumar",
          dateOfBirth: "2001-05-15",
          gender: "Male",
          address: "123 College Road, Thrissur",
          collegeId: 1,
          collegeIdNumber: "GEC20001",
          course: "B.Tech",
          department: "Computer Science",
          semester: "5",
          photoUrl: null,
          idCardUrl: null,
          addressProofUrl: null,
          altPhone: null
        });
        
        // Sample college admin
        const collegeUser = await this.createUser({
          username: "college1",
          password: hashedPassword,
          email: "college1@example.com",
          phone: "9876543211",
          userType: UserType.COLLEGE,
          collegeId: 1,
          depotId: null
        });
        
        // Sample depot admin
        const depotUser = await this.createUser({
          username: "depot1",
          password: hashedPassword,
          email: "depot1@example.com",
          phone: "9876543212",
          userType: UserType.DEPOT,
          collegeId: null,
          depotId: 1
        });
        
        console.log("Sample users created successfully");
      } catch (error) {
        console.error("Error creating sample users:", error);
      }
    })();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      userType: insertUser.userType as UserType,
      collegeId: insertUser.collegeId ?? null,
      depotId: insertUser.depotId ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.userId === userId
    );
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { 
      ...insertStudent, 
      id,
      altPhone: insertStudent.altPhone ?? null,
      verificationNotes: insertStudent.verificationNotes ?? null,
      photoUrl: insertStudent.photoUrl ?? null,
      idCardUrl: insertStudent.idCardUrl ?? null,
      addressProofUrl: insertStudent.addressProofUrl ?? null,
      documentsVerified: false
    };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudentDocument(studentId: number, documentType: string, documentUrl: string): Promise<Student | undefined> {
    const student = this.students.get(studentId);
    if (!student) return undefined;
    
    const updatedStudent = { ...student };
    
    // Update the appropriate document field based on type
    switch (documentType) {
      case 'idCard':
        updatedStudent.idCardUrl = documentUrl;
        break;
      case 'addressProof':
        updatedStudent.addressProofUrl = documentUrl;
        break;
      case 'photo':
        updatedStudent.photoUrl = documentUrl;
        break;
      default:
        // Unknown document type, don't update anything
        break;
    }
    
    this.students.set(studentId, updatedStudent);
    return updatedStudent;
  }
  
  async verifyStudentDocuments(studentId: number, verified: boolean, notes?: string): Promise<Student | undefined> {
    const student = this.students.get(studentId);
    if (!student) return undefined;
    
    const updatedStudent = { 
      ...student, 
      documentsVerified: verified,
      verificationNotes: notes || null
    };
    
    this.students.set(studentId, updatedStudent);
    return updatedStudent;
  }
  
  // College operations
  async getCollege(id: number): Promise<College | undefined> {
    return this.colleges.get(id);
  }
  
  async getAllColleges(): Promise<College[]> {
    return Array.from(this.colleges.values());
  }
  
  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const id = this.currentCollegeId++;
    const college: College = { 
      ...insertCollege, 
      id,
      userId: insertCollege.userId ?? null
    };
    this.colleges.set(id, college);
    return college;
  }
  
  // Depot operations
  async getDepot(id: number): Promise<Depot | undefined> {
    return this.depots.get(id);
  }
  
  async getAllDepots(): Promise<Depot[]> {
    return Array.from(this.depots.values());
  }
  
  async createDepot(insertDepot: InsertDepot): Promise<Depot> {
    const id = this.currentDepotId++;
    const depot: Depot = { 
      ...insertDepot, 
      id,
      userId: insertDepot.userId ?? null
    };
    this.depots.set(id, depot);
    return depot;
  }
  
  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async getApplicationsByStudentId(studentId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (application) => application.studentId === studentId
    );
  }
  
  async getApplicationsByCollegeId(collegeId: number, status?: ApplicationStatus): Promise<Application[]> {
    let applications = Array.from(this.applications.values()).filter(
      (application) => application.collegeId === collegeId
    );
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    return applications;
  }
  
  async getApplicationsByDepotId(depotId: number, status?: ApplicationStatus): Promise<Application[]> {
    let applications = Array.from(this.applications.values()).filter(
      (application) => application.depotId === depotId
    );
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    return applications;
  }
  
  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const applicationDate = new Date();
    const application: Application = { 
      ...insertApplication, 
      id, 
      applicationDate,
      status: ApplicationStatus.PENDING,
      collegeVerifiedAt: null,
      depotApprovedAt: null,
      paymentVerifiedAt: null,
      issuedAt: null,
      rejectionReason: null,
      isRenewal: insertApplication.isRenewal ?? false
    };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplicationStatus(id: number, status: ApplicationStatus, reason?: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    
    // Update timestamps based on status
    const now = new Date();
    if (status === ApplicationStatus.COLLEGE_VERIFIED || status === ApplicationStatus.COLLEGE_REJECTED) {
      updatedApplication.collegeVerifiedAt = now;
      if (status === ApplicationStatus.COLLEGE_REJECTED && reason) {
        updatedApplication.rejectionReason = reason;
      }
    } else if (status === ApplicationStatus.DEPOT_APPROVED || status === ApplicationStatus.DEPOT_REJECTED) {
      updatedApplication.depotApprovedAt = now;
      if (status === ApplicationStatus.DEPOT_REJECTED && reason) {
        updatedApplication.rejectionReason = reason;
      }
    } else if (status === ApplicationStatus.PAYMENT_VERIFIED) {
      updatedApplication.paymentVerifiedAt = now;
    } else if (status === ApplicationStatus.ISSUED) {
      updatedApplication.issuedAt = now;
    }
    
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async updateApplicationPayment(id: number, paymentDetails: PaymentDetails): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      paymentDetails, 
      status: ApplicationStatus.PAYMENT_PENDING 
    };
    
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
}

// Storage types
export enum StorageType {
  MEMORY = 'memory',
  MONGODB = 'mongodb'
}

// Initialize storage instance with default memory storage
let storageInstance: IStorage = new MemStorage();

export function initializeStorage(type: StorageType): void {
  switch (type) {
    case StorageType.MONGODB:
      storageInstance = new MongoDBStorage();
      break;
    case StorageType.MEMORY:
    default:
      storageInstance = new MemStorage();
      break;
  }
}

// Export the storage instance
export const storage: IStorage = {
  // Initialize with the default storage instance
  getUser: async (id) => storageInstance.getUser(id),
  getUserByUsername: async (username) => storageInstance.getUserByUsername(username),
  createUser: async (user) => storageInstance.createUser(user),
  updateUser: async (id, updates) => storageInstance.updateUser(id, updates),
  getStudent: async (id) => storageInstance.getStudent(id),
  getStudentByUserId: async (userId) => storageInstance.getStudentByUserId(userId),
  createStudent: async (student) => storageInstance.createStudent(student),
  updateStudentDocument: async (studentId, documentType, documentUrl) => 
    storageInstance.updateStudentDocument(studentId, documentType, documentUrl),
  verifyStudentDocuments: async (studentId, verified, notes) => 
    storageInstance.verifyStudentDocuments(studentId, verified, notes),
  getCollege: async (id) => storageInstance.getCollege(id),
  getAllColleges: async () => storageInstance.getAllColleges(),
  createCollege: async (college) => storageInstance.createCollege(college),
  getDepot: async (id) => storageInstance.getDepot(id),
  getAllDepots: async () => storageInstance.getAllDepots(),
  createDepot: async (depot) => storageInstance.createDepot(depot),
  getApplication: async (id) => storageInstance.getApplication(id),
  getApplicationsByStudentId: async (studentId) => storageInstance.getApplicationsByStudentId(studentId),
  getApplicationsByCollegeId: async (collegeId, status) => storageInstance.getApplicationsByCollegeId(collegeId, status),
  getApplicationsByDepotId: async (depotId, status) => storageInstance.getApplicationsByDepotId(depotId, status),
  getAllApplications: async () => storageInstance.getAllApplications(),
  createApplication: async (application) => storageInstance.createApplication(application),
  updateApplicationStatus: async (id, status, reason) => storageInstance.updateApplicationStatus(id, status, reason),
  updateApplicationPayment: async (id, paymentDetails) => storageInstance.updateApplicationPayment(id, paymentDetails),
  sessionStore: storageInstance.sessionStore
};

// Initialize storage immediately
initializeStorage(process.env.USE_MONGODB === 'true' ? StorageType.MONGODB : StorageType.MEMORY);

// Replace the storage object with the initialized instance
Object.assign(storage, storageInstance);
