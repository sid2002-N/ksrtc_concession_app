import { IStorage } from '../storage';
import { 
  User, College, Depot, Student, Application, 
  IUser, ICollege, IDepot, IStudent, IApplication 
} from './models';
import mongoose from 'mongoose';
import { 
  User as UserType, 
  College as CollegeType, 
  Depot as DepotType, 
  Student as StudentType, 
  Application as ApplicationType,
  InsertUser, InsertStudent, InsertCollege, InsertDepot, InsertApplication,
  ApplicationStatus, PaymentDetails
} from '@shared/schema';
import session from 'express-session';
import connectMongo from 'connect-mongo';

// Create MongoDB session store
const MongoStore = connectMongo;

// Converts MongoDB document to schema type
function documentToType<T, D>(doc: D | null): T | undefined {
  if (!doc) return undefined;
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  return obj as unknown as T;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ksrtc_concession',
      ttl: 14 * 24 * 60 * 60 // 14 days
    });
  }

  // User operations
  async getUser(id: number): Promise<UserType | undefined> {
    const user = await User.findById(id);
    return documentToType<UserType, IUser>(user);
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    const user = await User.findOne({ username });
    return documentToType<UserType, IUser>(user);
  }

  async createUser(user: InsertUser): Promise<UserType> {
    const newUser = new User(user);
    await newUser.save();
    return documentToType<UserType, IUser>(newUser)!;
  }
  
  async updateUser(id: number, updates: Partial<UserType>): Promise<UserType | undefined> {
    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    );
    return documentToType<UserType, IUser>(user);
  }

  // Student operations
  async getStudent(id: number): Promise<StudentType | undefined> {
    const student = await Student.findById(id);
    return documentToType<StudentType, IStudent>(student);
  }

  async getStudentByUserId(userId: number): Promise<StudentType | undefined> {
    const student = await Student.findOne({ userId: new mongoose.Types.ObjectId(userId.toString()) });
    return documentToType<StudentType, IStudent>(student);
  }

  async createStudent(student: InsertStudent): Promise<StudentType> {
    const newStudent = new Student({
      ...student,
      userId: new mongoose.Types.ObjectId(student.userId.toString()),
      collegeId: new mongoose.Types.ObjectId(student.collegeId.toString())
    });
    await newStudent.save();
    return documentToType<StudentType, IStudent>(newStudent)!;
  }

  async updateStudentDocument(studentId: number, documentType: string, documentUrl: string): Promise<StudentType | undefined> {
    const student = await Student.findById(studentId);
    if (!student) return undefined;

    // Safely update document fields based on type
    if (documentType === 'idCard') {
      student.idCard = documentUrl;
    } else if (documentType === 'photo') {
      student.photo = documentUrl;
    } else if (documentType === 'collegeIdCard') {
      student.collegeIdCard = documentUrl;
    }
    
    await student.save();
    return documentToType<StudentType, IStudent>(student);
  }

  async verifyStudentDocuments(studentId: number, verified: boolean, notes?: string): Promise<StudentType | undefined> {
    const student = await Student.findById(studentId);
    if (!student) return undefined;

    student.documentsVerified = verified;
    if (notes) student.verificationNotes = notes;
    await student.save();
    return documentToType<StudentType, IStudent>(student);
  }

  // College operations
  async getCollege(id: number): Promise<CollegeType | undefined> {
    const college = await College.findById(id);
    return documentToType<CollegeType, ICollege>(college);
  }

  async getAllColleges(): Promise<CollegeType[]> {
    const colleges = await College.find();
    return colleges.map(college => documentToType<CollegeType, ICollege>(college)!);
  }

  async createCollege(college: InsertCollege): Promise<CollegeType> {
    const newCollege = new College(college);
    await newCollege.save();
    return documentToType<CollegeType, ICollege>(newCollege)!;
  }

  // Depot operations
  async getDepot(id: number): Promise<DepotType | undefined> {
    const depot = await Depot.findById(id);
    return documentToType<DepotType, IDepot>(depot);
  }

  async getAllDepots(): Promise<DepotType[]> {
    const depots = await Depot.find();
    return depots.map(depot => documentToType<DepotType, IDepot>(depot)!);
  }

  async createDepot(depot: InsertDepot): Promise<DepotType> {
    const newDepot = new Depot(depot);
    await newDepot.save();
    return documentToType<DepotType, IDepot>(newDepot)!;
  }

  // Application operations
  async getApplication(id: number): Promise<ApplicationType | undefined> {
    const application = await Application.findById(id);
    return documentToType<ApplicationType, IApplication>(application);
  }

  async getApplicationsByStudentId(studentId: number): Promise<ApplicationType[]> {
    const applications = await Application.find({ 
      studentId: new mongoose.Types.ObjectId(studentId.toString()) 
    });
    return applications.map(app => documentToType<ApplicationType, IApplication>(app)!);
  }

  async getApplicationsByCollegeId(collegeId: number, status?: ApplicationStatus): Promise<ApplicationType[]> {
    const query: any = { collegeId: new mongoose.Types.ObjectId(collegeId.toString()) };
    if (status) query.status = status;
    
    const applications = await Application.find(query);
    return applications.map(app => documentToType<ApplicationType, IApplication>(app)!);
  }

  async getApplicationsByDepotId(depotId: number, status?: ApplicationStatus): Promise<ApplicationType[]> {
    const query: any = { depotId: new mongoose.Types.ObjectId(depotId.toString()) };
    if (status) query.status = status;
    
    const applications = await Application.find(query);
    return applications.map(app => documentToType<ApplicationType, IApplication>(app)!);
  }

  async createApplication(application: InsertApplication): Promise<ApplicationType> {
    const newApplication = new Application({
      ...application,
      studentId: new mongoose.Types.ObjectId(application.studentId.toString()),
      collegeId: new mongoose.Types.ObjectId(application.collegeId.toString()),
      depotId: new mongoose.Types.ObjectId(application.depotId.toString())
    });
    await newApplication.save();
    return documentToType<ApplicationType, IApplication>(newApplication)!;
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus, reason?: string): Promise<ApplicationType | undefined> {
    const application = await Application.findById(id);
    if (!application) return undefined;

    application.status = status;
    if (reason) application.statusReason = reason;
    await application.save();
    return documentToType<ApplicationType, IApplication>(application);
  }

  async updateApplicationPayment(id: number, paymentDetails: PaymentDetails): Promise<ApplicationType | undefined> {
    const application = await Application.findById(id);
    if (!application) return undefined;

    application.paymentDetails = {
      ...paymentDetails,
      transactionDate: new Date(paymentDetails.transactionDate)
    };
    application.status = ApplicationStatus.PAYMENT_VERIFIED;
    await application.save();
    return documentToType<ApplicationType, IApplication>(application);
  }
}