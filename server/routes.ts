import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  ApplicationStatus, 
  UserType, 
  insertApplicationSchema, 
  paymentSubmissionSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper middleware to check if user is authenticated
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Helper middleware to check if user has a specific role
  const hasRole = (role: UserType) => (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType === role) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
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

  const httpServer = createServer(app);
  return httpServer;
}
