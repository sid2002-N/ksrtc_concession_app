import { IStorage } from '../storage';
import { 
  User, Student, College, Depot, Application,
  InsertUser, InsertStudent, InsertCollege, InsertDepot, InsertApplication,
  ApplicationStatus, PaymentDetails, UserType
} from '@shared/schema';
import { User as UserModel, IUser, Student as StudentModel, IStudent, College as CollegeModel, ICollege, Depot as DepotModel, IDepot, Application as ApplicationModel, IApplication } from './models';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

// Helper function to convert Mongoose document to schema type
function documentToType<T, D>(doc: D | null): T | undefined {
  if (!doc) return undefined;
  const obj = (doc as any).toObject ? (doc as any).toObject() : doc;
  // Convert MongoDB _id to id to match our schema types
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  // Convert other ObjectIDs to strings for nested references
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof mongoose.Types.ObjectId) {
      obj[key] = obj[key].toString();
    }
  });
  
  return obj as T;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ksrtc-concession',
      collectionName: 'sessions'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ _id: id });
      return documentToType<User, IUser>(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      return documentToType<User, IUser>(user);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        ...user,
        createdAt: new Date()
      });
      await newUser.save();
      return documentToType<User, IUser>(newUser)!;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: updates },
        { new: true }
      );
      return documentToType<User, IUser>(user);
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Student operations
  async getStudent(id: number): Promise<StudentType | undefined> {
    try {
      const student = await StudentModel.findById(id);
      return documentToType<Student, IStudent>(student);
    } catch (error) {
      console.error('Error fetching student:', error);
      return undefined;
    }
  }

  async getStudentByUserId(userId: number): Promise<StudentType | undefined> {
    try {
      const student = await StudentModel.findOne({ userId });
      return documentToType<Student, IStudent>(student);
    } catch (error) {
      console.error('Error fetching student by user ID:', error);
      return undefined;
    }
  }

  async createStudent(student: InsertStudent): Promise<StudentType> {
    try {
      const newStudent = new StudentModel({
        userId: student.userId,
        firstName: student.firstName,
        lastName: student.lastName,
        collegeIdNumber: student.collegeIdNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        altPhone: student.altPhone,
        address: student.address,
        course: student.course,
        department: student.department,
        semester: student.semester,
        collegeId: student.collegeId,
        photoUrl: student.photoUrl,
      });
      
      const savedStudent = await newStudent.save();
      return documentToType<Student, IStudent>(savedStudent) as Student;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudentDocument(studentId: number, documentType: string, documentUrl: string): Promise<StudentType | undefined> {
    try {
      const updateData: Record<string, any> = {};
      
      if (documentType === 'photo') {
        updateData.photoUrl = documentUrl;
      } else if (documentType === 'idCard') {
        updateData.idCardUrl = documentUrl;
      } else if (documentType === 'collegeIdCard') {
        updateData.collegeIdCardUrl = documentUrl;
      }
      
      const updatedStudent = await StudentModel.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { new: true }
      );
      
      return documentToType<Student, IStudent>(updatedStudent);
    } catch (error) {
      console.error('Error updating student document:', error);
      return undefined;
    }
  }

  async verifyStudentDocuments(studentId: number, verified: boolean, notes?: string): Promise<StudentType | undefined> {
    try {
      const updatedStudent = await StudentModel.findByIdAndUpdate(
        studentId,
        { 
          $set: { 
            documentsVerified: verified,
            verificationNotes: notes || null
          } 
        },
        { new: true }
      );
      
      return documentToType<Student, IStudent>(updatedStudent);
    } catch (error) {
      console.error('Error verifying student documents:', error);
      return undefined;
    }
  }

  // College operations
  async getCollege(id: number): Promise<CollegeType | undefined> {
    try {
      const college = await CollegeModel.findById(id);
      return documentToType<College, ICollege>(college);
    } catch (error) {
      console.error('Error fetching college:', error);
      return undefined;
    }
  }

  async getAllColleges(): Promise<CollegeType[]> {
    try {
      const colleges = await CollegeModel.find();
      return colleges.map(college => documentToType<College, ICollege>(college) as College);
    } catch (error) {
      console.error('Error fetching all colleges:', error);
      return [];
    }
  }

  async createCollege(college: InsertCollege): Promise<CollegeType> {
    try {
      const newCollege = new CollegeModel({
        name: college.name,
        address: college.address,
        district: college.district,
        contactPerson: college.contactPerson,
        email: college.email,
        phone: college.phone,
        userId: college.userId,
      });
      
      const savedCollege = await newCollege.save();
      return documentToType<College, ICollege>(savedCollege) as College;
    } catch (error) {
      console.error('Error creating college:', error);
      throw error;
    }
  }

  // Depot operations
  async getDepot(id: number): Promise<DepotType | undefined> {
    try {
      const depot = await DepotModel.findById(id);
      return documentToType<Depot, IDepot>(depot);
    } catch (error) {
      console.error('Error fetching depot:', error);
      return undefined;
    }
  }

  async getAllDepots(): Promise<DepotType[]> {
    try {
      const depots = await DepotModel.find();
      return depots.map(depot => documentToType<Depot, IDepot>(depot) as Depot);
    } catch (error) {
      console.error('Error fetching all depots:', error);
      return [];
    }
  }

  async createDepot(depot: InsertDepot): Promise<DepotType> {
    try {
      const newDepot = new DepotModel({
        name: depot.name,
        location: depot.location,
        address: depot.address,
        contactPerson: depot.contactPerson,
        email: depot.email,
        phone: depot.phone,
        userId: depot.userId,
      });
      
      const savedDepot = await newDepot.save();
      return documentToType<Depot, IDepot>(savedDepot) as Depot;
    } catch (error) {
      console.error('Error creating depot:', error);
      throw error;
    }
  }

  // Application operations
  async getApplication(id: number): Promise<ApplicationType | undefined> {
    try {
      const application = await ApplicationModel.findById(id);
      return documentToType<Application, IApplication>(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      return undefined;
    }
  }

  async getApplicationsByStudentId(studentId: number): Promise<ApplicationType[]> {
    try {
      const applications = await ApplicationModel.find({ studentId });
      return applications.map(app => documentToType<Application, IApplication>(app) as Application);
    } catch (error) {
      console.error('Error fetching applications by student ID:', error);
      return [];
    }
  }

  async getApplicationsByCollegeId(collegeId: number, status?: ApplicationStatus): Promise<ApplicationType[]> {
    try {
      const query: any = { collegeId };
      if (status) {
        query.status = status;
      }
      
      const applications = await ApplicationModel.find(query);
      return applications.map(app => documentToType<Application, IApplication>(app) as Application);
    } catch (error) {
      console.error('Error fetching applications by college ID:', error);
      return [];
    }
  }

  async getApplicationsByDepotId(depotId: number, status?: ApplicationStatus): Promise<ApplicationType[]> {
    try {
      const query: any = { depotId };
      if (status) {
        query.status = status;
      }
      
      const applications = await ApplicationModel.find(query);
      return applications.map(app => documentToType<Application, IApplication>(app) as Application);
    } catch (error) {
      console.error('Error fetching applications by depot ID:', error);
      return [];
    }
  }

  async createApplication(application: InsertApplication): Promise<ApplicationType> {
    try {
      const newApplication = new ApplicationModel({
        studentId: application.studentId,
        collegeId: application.collegeId,
        depotId: application.depotId,
        startPoint: application.startPoint,
        endPoint: application.endPoint,
        status: application.status,
      });
      
      const savedApplication = await newApplication.save();
      return documentToType<Application, IApplication>(savedApplication) as Application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus, reason?: string): Promise<ApplicationType | undefined> {
    try {
      const updateData: any = { status };
      
      if (reason) {
        updateData.rejectionReason = reason;
      }
      
      // Update the appropriate timestamp based on status
      if (status === ApplicationStatus.COLLEGE_VERIFIED || status === ApplicationStatus.COLLEGE_REJECTED) {
        updateData.collegeVerifiedAt = new Date();
      } else if (status === ApplicationStatus.DEPOT_APPROVED || status === ApplicationStatus.DEPOT_REJECTED) {
        updateData.depotApprovedAt = new Date();
      } else if (status === ApplicationStatus.PAYMENT_VERIFIED) {
        updateData.paymentVerifiedAt = new Date();
      } else if (status === ApplicationStatus.ISSUED) {
        updateData.issuedAt = new Date();
      }
      
      const updatedApplication = await ApplicationModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      
      return documentToType<Application, IApplication>(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      return undefined;
    }
  }

  async updateApplicationPayment(id: number, paymentDetails: PaymentDetails): Promise<ApplicationType | undefined> {
    try {
      const updatedApplication = await ApplicationModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            paymentDetails: paymentDetails,
            status: ApplicationStatus.PAYMENT_PENDING 
          } 
        },
        { new: true }
      );
      
      return documentToType<Application, IApplication>(updatedApplication);
    } catch (error) {
      console.error('Error updating application payment:', error);
      return undefined;
    }
  }
  
  async getAllApplications(): Promise<ApplicationType[]> {
    try {
      const applications = await ApplicationModel.find({});
      return applications.map(app => documentToType<Application, IApplication>(app) as Application);
    } catch (error) {
      console.error('Error fetching all applications:', error);
      return [];
    }
  }
}