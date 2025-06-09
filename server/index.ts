import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDB } from "./db/connection";
import { storage, initializeStorage, StorageType } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Determine if MongoDB should be used
    const useMongoDB = process.env.USE_MONGODB === 'true';
    
    if (useMongoDB) {
      // Try to connect to MongoDB
      const connected = await connectToDB();
      if (connected) {
        // Initialize MongoDB storage
        initializeStorage(StorageType.MONGODB);
        log("Using MongoDB for data storage", "mongoose");
      } else {
        // Fallback to in-memory storage if MongoDB connection fails
        initializeStorage(StorageType.MEMORY);
        log("Failed to connect to MongoDB, using in-memory storage", "mongoose");
      }
    } else {
      // Use in-memory storage
      initializeStorage(StorageType.MEMORY);
      log("Using in-memory storage", "mongoose");
    }

    // Register routes after storage is initialized
    registerRoutes(app);

    // Start the server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      log(`serving on port ${port}`, "express");
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
