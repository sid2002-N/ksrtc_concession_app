import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ksrtc-concession-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    }, async (req, username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // If user not found or wrong password, return false
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        
        // Check if userType matches (only if specified in request)
        if (req.body.userType && user.userType !== req.body.userType) {
          return done(null, false);
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, userType, phone, ...otherData } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create user with appropriate ID fields based on type
      const hashedPassword = await hashPassword(password);
      let collegeId = null;
      let depotId = null;
      
      if (userType === UserType.STUDENT) {
        collegeId = otherData.collegeId;
      }
      
      // Create the user account
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        userType,
        phone,
        collegeId,
        depotId
      });
      
      // Create specific profiles based on user type
      if (userType === UserType.STUDENT) {
        await storage.createStudent({
          userId: user.id,
          firstName: otherData.firstName,
          lastName: otherData.lastName,
          collegeIdNumber: otherData.collegeIdNumber,
          dateOfBirth: otherData.dateOfBirth,
          gender: otherData.gender,
          altPhone: otherData.altPhone,
          address: otherData.address,
          course: otherData.course,
          department: otherData.department,
          semester: otherData.semester,
          collegeId: otherData.collegeId,
          photoUrl: otherData.photoUrl
        });
      } else if (userType === UserType.COLLEGE) {
        // Create college profile
        const college = await storage.createCollege({
          name: otherData.name,
          address: otherData.address,
          district: otherData.district,
          contactPerson: otherData.contactPerson,
          phone,
          email,
          userId: user.id
        });
        
        // Update user with collegeId
        await storage.updateUser(user.id, { collegeId: college.id });
      } else if (userType === UserType.DEPOT) {
        // Create depot profile
        const depot = await storage.createDepot({
          name: otherData.name,
          location: otherData.location,
          address: otherData.address,
          contactPerson: otherData.contactPerson,
          phone,
          email,
          userId: user.id
        });
        
        // Update user with depotId
        await storage.updateUser(user.id, { depotId: depot.id });
      }

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send the password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send the password back to the client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
