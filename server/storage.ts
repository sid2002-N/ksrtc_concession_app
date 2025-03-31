import { applications, colleges, depots, students, users } from "@shared/schema";
import type { 
  User, InsertUser, 
  Student, InsertStudent, 
  College, InsertCollege, 
  Depot, InsertDepot, 
  Application, InsertApplication,
  UserType, ApplicationStatus, PaymentDetails
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
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
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: ApplicationStatus, reason?: string): Promise<Application | undefined>;
  updateApplicationPayment(id: number, paymentDetails: PaymentDetails): Promise<Application | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private colleges: Map<number, College>;
  private depots: Map<number, Depot>;
  private applications: Map<number, Application>;
  
  sessionStore: session.SessionStore;
  
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
    colleges.forEach(college => this.createCollege(college));
    
    // Initialize depots
    depots.forEach(depot => this.createDepot(depot));
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
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
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
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
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
    const college: College = { ...insertCollege, id };
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
    const depot: Depot = { ...insertDepot, id };
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
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const applicationDate = new Date();
    const application: Application = { 
      ...insertApplication, 
      id, 
      applicationDate,
      collegeVerifiedAt: null,
      depotApprovedAt: null,
      paymentVerifiedAt: null,
      issuedAt: null
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

export const storage = new MemStorage();
