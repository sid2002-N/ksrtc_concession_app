import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  ApplicationStatus, 
  UserType, 
  insertApplicationSchema, 
  paymentSubmissionSchema,
  documentUploadSchema,
  documentVerificationSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Helper middleware to check if user has a specific role
  const hasRole = (role: UserType) => (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && req.user.userType === role) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };
  
  // Helper middleware to check if user is an admin (DEPOT role for now)
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && req.user.userType === UserType.DEPOT) {
      return next();
    }
    res.status(403).json({ message: "Admin access required" });
  };

  // GET /api/colleges - Get all colleges
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getAllColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  // GET /api/depots - Get all depots
  app.get("/api/depots", async (req, res) => {
    try {
      const depots = await storage.getAllDepots();
      res.json(depots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch depots" });
    }
  });

  // GET /api/student - Get student profile for current user
  app.get("/api/student", isAuthenticated, hasRole(UserType.STUDENT), async (req, res) => {
    try {
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  // POST /api/applications - Create new application
  app.post("/api/applications", isAuthenticated, hasRole(UserType.STUDENT), async (req, res) => {
    try {
      // Get student profile
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      // Validate application data
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        studentId: student.id,
        collegeId: student.collegeId,
        status: ApplicationStatus.PENDING
      });

      // Create application
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create application" });
      }
    }
  });

  // GET /api/applications - Get applications for current user
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      let applications = [];

      if (req.user.userType === UserType.STUDENT) {
        // Get student profile
        const student = await storage.getStudentByUserId(req.user.id);
        if (!student) {
          return res.status(404).json({ message: "Student profile not found" });
        }
        applications = await storage.getApplicationsByStudentId(student.id);
      } else if (req.user.userType === UserType.COLLEGE && req.user.collegeId) {
        // Filter by status if provided
        const status = req.query.status as ApplicationStatus | undefined;
        applications = await storage.getApplicationsByCollegeId(req.user.collegeId, status);
      } else if (req.user.userType === UserType.DEPOT && req.user.depotId) {
        // Filter by status if provided
        const status = req.query.status as ApplicationStatus | undefined;
        applications = await storage.getApplicationsByDepotId(req.user.depotId, status);
      }

      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // GET /api/applications/:id - Get application by ID
  app.get("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const application = await storage.getApplication(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user has permission to view this application
      if (req.user.userType === UserType.STUDENT) {
        const student = await storage.getStudentByUserId(req.user.id);
        if (!student || application.studentId !== student.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (req.user.userType === UserType.COLLEGE) {
        if (application.collegeId !== req.user.collegeId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else if (req.user.userType === UserType.DEPOT) {
        if (application.depotId !== req.user.depotId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // PATCH /api/applications/:id/status - Update application status
  app.patch("/api/applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status, reason } = req.body;
      const applicationId = parseInt(req.params.id);
      
      // Fetch the application
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user has permission to update this application
      if (req.user.userType === UserType.COLLEGE) {
        // College can only update to college_verified or college_rejected
        if (application.collegeId !== req.user.collegeId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        if (![ApplicationStatus.COLLEGE_VERIFIED, ApplicationStatus.COLLEGE_REJECTED].includes(status)) {
          return res.status(400).json({ message: "Invalid status for college" });
        }
        if (application.status !== ApplicationStatus.PENDING) {
          return res.status(400).json({ message: "Can only update pending applications" });
        }
      } else if (req.user.userType === UserType.DEPOT) {
        // Depot can only update to depot_approved, depot_rejected, or payment_verified
        if (application.depotId !== req.user.depotId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        if (![ApplicationStatus.DEPOT_APPROVED, ApplicationStatus.DEPOT_REJECTED, ApplicationStatus.PAYMENT_VERIFIED, ApplicationStatus.ISSUED].includes(status)) {
          return res.status(400).json({ message: "Invalid status for depot" });
        }
        if (status === ApplicationStatus.DEPOT_APPROVED || status === ApplicationStatus.DEPOT_REJECTED) {
          if (application.status !== ApplicationStatus.COLLEGE_VERIFIED) {
            return res.status(400).json({ message: "Can only approve/reject college verified applications" });
          }
        } else if (status === ApplicationStatus.PAYMENT_VERIFIED) {
          if (application.status !== ApplicationStatus.PAYMENT_PENDING) {
            return res.status(400).json({ message: "Can only verify payment pending applications" });
          }
        } else if (status === ApplicationStatus.ISSUED) {
          if (application.status !== ApplicationStatus.PAYMENT_VERIFIED) {
            return res.status(400).json({ message: "Can only issue payment verified applications" });
          }
        }
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update the application status
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status, reason);
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // POST /api/applications/:id/payment - Submit payment details
  app.post("/api/applications/:id/payment", isAuthenticated, hasRole(UserType.STUDENT), async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      
      // Validate payment data
      const paymentData = paymentSubmissionSchema.parse({
        ...req.body,
        applicationId
      });
      
      // Fetch the application
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if student owns this application
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student || application.studentId !== student.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if application is in the right status
      if (application.status !== ApplicationStatus.DEPOT_APPROVED) {
        return res.status(400).json({ message: "Application must be approved by depot before payment" });
      }
      
      // Update payment details
      const updatedApplication = await storage.updateApplicationPayment(
        applicationId, 
        {
          transactionId: paymentData.transactionId,
          transactionDate: paymentData.transactionDate,
          accountHolder: paymentData.accountHolder,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        }
      );
      
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit payment details" });
      }
    }
  });

  // POST /api/student/documents - Upload student document
  app.post("/api/student/documents", isAuthenticated, hasRole(UserType.STUDENT), async (req, res) => {
    try {
      // Validate document upload data
      const documentData = documentUploadSchema.parse(req.body);
      
      // Get student profile
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      
      // Update student document
      const updatedStudent = await storage.updateStudentDocument(
        student.id,
        documentData.documentType,
        documentData.documentUrl
      );
      
      res.json(updatedStudent);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  });
  
  // POST /api/student/:id/verify-documents - Verify student documents (college only)
  app.post("/api/student/:id/verify-documents", isAuthenticated, hasRole(UserType.COLLEGE), async (req, res) => {
    try {
      // Validate document verification data
      const verificationData = documentVerificationSchema.parse(req.body);
      
      const studentId = parseInt(req.params.id);
      
      // Get student
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Check if college has permission
      if (student.collegeId !== req.user.collegeId) {
        return res.status(403).json({ message: "Forbidden: Student not affiliated with your college" });
      }
      
      // Verify student documents
      const updatedStudent = await storage.verifyStudentDocuments(
        studentId,
        verificationData.documentsVerified,
        verificationData.verificationNotes
      );
      
      res.json(updatedStudent);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid verification data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to verify documents" });
      }
    }
  });

  // ========== ANALYTICS ENDPOINTS ==========

  // GET /api/analytics/applications/status - Get application count by status
  app.get("/api/analytics/applications/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all applications
      const applications = await storage.getAllApplications();
      
      // Count applications by status
      const statusCounts: Record<string, number> = {};
      
      // Initialize counters for all statuses
      Object.values(ApplicationStatus).forEach(status => {
        statusCounts[status] = 0;
      });
      
      // Count applications by status
      applications.forEach(app => {
        if (statusCounts[app.status] !== undefined) {
          statusCounts[app.status]++;
        }
      });
      
      res.json({
        totalApplications: applications.length,
        statusCounts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application status analytics" });
    }
  });

  // GET /api/analytics/applications/timeline - Get application count timeline by month
  app.get("/api/analytics/applications/timeline", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all applications
      const applications = await storage.getAllApplications();
      
      // Group applications by month
      const monthlyStats: Record<string, {total: number, byStatus: Record<string, number>}> = {};
      
      applications.forEach(app => {
        const date = new Date(app.applicationDate);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyStats[monthYear]) {
          monthlyStats[monthYear] = { 
            total: 0, 
            byStatus: Object.fromEntries(Object.values(ApplicationStatus).map(status => [status, 0]))
          };
        }
        
        monthlyStats[monthYear].total++;
        monthlyStats[monthYear].byStatus[app.status]++;
      });
      
      // Sort by date (chronologically)
      const sortedTimeline = Object.entries(monthlyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, stats]) => ({
          month,
          ...stats
        }));
      
      res.json(sortedTimeline);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application timeline analytics" });
    }
  });

  // GET /api/analytics/colleges/applications - Get application counts by college
  app.get("/api/analytics/colleges/applications", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all colleges
      const colleges = await storage.getAllColleges();
      
      // Get all applications
      const applications = await storage.getAllApplications();
      
      // Count applications by college
      const collegeStats = colleges.map(college => {
        const collegeApps = applications.filter(app => app.collegeId === college.id);
        
        // Count by status
        const statusCounts: Record<string, number> = {};
        
        // Initialize counters for all statuses
        Object.values(ApplicationStatus).forEach(status => {
          statusCounts[status] = 0;
        });
        
        // Count by status
        collegeApps.forEach(app => {
          statusCounts[app.status]++;
        });
        
        return {
          collegeId: college.id,
          collegeName: college.name,
          totalApplications: collegeApps.length,
          statusCounts
        };
      });
      
      // Sort by total applications count (descending)
      collegeStats.sort((a, b) => b.totalApplications - a.totalApplications);
      
      res.json(collegeStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch college analytics" });
    }
  });

  // GET /api/analytics/depots/applications - Get application counts by depot
  app.get("/api/analytics/depots/applications", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all depots
      const depots = await storage.getAllDepots();
      
      // Get all applications
      const applications = await storage.getAllApplications();
      
      // Count applications by depot
      const depotStats = depots.map(depot => {
        const depotApps = applications.filter(app => app.depotId === depot.id);
        
        // Count by status
        const statusCounts: Record<string, number> = {};
        
        // Initialize counters for all statuses
        Object.values(ApplicationStatus).forEach(status => {
          statusCounts[status] = 0;
        });
        
        // Count by status
        depotApps.forEach(app => {
          statusCounts[app.status]++;
        });
        
        // Calculate average processing time (for approved applications)
        let totalProcessingDays = 0;
        let processedCount = 0;
        
        depotApps.forEach(app => {
          if (app.status === ApplicationStatus.ISSUED && app.applicationDate && app.issuedAt) {
            const applicationDate = new Date(app.applicationDate);
            const issuedDate = new Date(app.issuedAt);
            const diffTime = Math.abs(issuedDate.getTime() - applicationDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalProcessingDays += diffDays;
            processedCount++;
          }
        });
        
        const avgProcessingDays = processedCount > 0 ? totalProcessingDays / processedCount : 0;
        
        return {
          depotId: depot.id,
          depotName: depot.name,
          totalApplications: depotApps.length,
          avgProcessingDays,
          statusCounts
        };
      });
      
      // Sort by total applications count (descending)
      depotStats.sort((a, b) => b.totalApplications - a.totalApplications);
      
      res.json(depotStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch depot analytics" });
    }
  });

  // GET /api/analytics/payments/summary - Get payment statistics
  app.get("/api/analytics/payments/summary", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get applications with payment details
      const applications = await storage.getAllApplications();
      const paidApplications = applications.filter(app => 
        app.paymentDetails && 
        app.paymentDetails.transactionId &&
        app.status !== ApplicationStatus.PENDING
      );
      
      // Calculate payment statistics
      const totalRevenue = paidApplications.reduce((sum, app) => 
        sum + (app.paymentDetails?.amount || 0), 0);
      
      // Group by payment method
      const paymentMethodStats: Record<string, {count: number, amount: number}> = {};
      
      paidApplications.forEach(app => {
        const method = app.paymentDetails?.paymentMethod || 'Unknown';
        
        if (!paymentMethodStats[method]) {
          paymentMethodStats[method] = { count: 0, amount: 0 };
        }
        
        paymentMethodStats[method].count++;
        paymentMethodStats[method].amount += app.paymentDetails?.amount || 0;
      });
      
      // Group by month
      const monthlyRevenue: Record<string, number> = {};
      
      paidApplications.forEach(app => {
        if (app.paymentDetails?.transactionDate) {
          const date = new Date(app.paymentDetails.transactionDate);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyRevenue[monthYear]) {
            monthlyRevenue[monthYear] = 0;
          }
          
          monthlyRevenue[monthYear] += app.paymentDetails?.amount || 0;
        }
      });
      
      // Sort monthly revenue by date
      const sortedMonthlyRevenue = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount }));
      
      res.json({
        totalPayments: paidApplications.length,
        totalRevenue,
        averagePaymentAmount: paidApplications.length > 0 ? totalRevenue / paidApplications.length : 0,
        paymentMethodStats,
        monthlyRevenue: sortedMonthlyRevenue
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment analytics" });
    }
  });

  // GET /api/analytics/processing-time - Get application processing time statistics
  app.get("/api/analytics/processing-time", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all applications
      const applications = await storage.getAllApplications();
      
      // Calculate average time between status changes
      const processingTimeStats = {
        // Avg time from application submission to college verification
        submissionToCollegeVerification: calculateAverageTimeBetweenStatuses(
          applications,
          app => app.applicationDate, 
          app => app.collegeVerifiedAt
        ),
        
        // Avg time from college verification to depot approval
        collegeVerificationToDepotApproval: calculateAverageTimeBetweenStatuses(
          applications,
          app => app.collegeVerifiedAt, 
          app => app.depotApprovedAt
        ),
        
        // Avg time from depot approval to payment verification
        depotApprovalToPaymentVerification: calculateAverageTimeBetweenStatuses(
          applications,
          app => app.depotApprovedAt, 
          app => app.paymentVerifiedAt
        ),
        
        // Avg time from payment verification to issuance
        paymentVerificationToIssuance: calculateAverageTimeBetweenStatuses(
          applications,
          app => app.paymentVerifiedAt, 
          app => app.issuedAt
        ),
        
        // Overall avg processing time (from submission to issuance)
        overallProcessingTime: calculateAverageTimeBetweenStatuses(
          applications,
          app => app.applicationDate, 
          app => app.issuedAt
        )
      };
      
      res.json(processingTimeStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processing time analytics" });
    }
  });

  // Helper function to calculate average time between status changes
  function calculateAverageTimeBetweenStatuses(
    applications: any[], 
    getStartDate: (app: any) => Date | null | undefined, 
    getEndDate: (app: any) => Date | null | undefined
  ) {
    let totalDays = 0;
    let count = 0;
    
    applications.forEach(app => {
      const startDate = getStartDate(app);
      const endDate = getEndDate(app);
      
      if (startDate && endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        totalDays += diffDays;
        count++;
      }
    });
    
    return {
      averageDays: count > 0 ? totalDays / count : 0,
      totalApplications: count
    };
  }

  const httpServer = createServer(app);
  return httpServer;
}
