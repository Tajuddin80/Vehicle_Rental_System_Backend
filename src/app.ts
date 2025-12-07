import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicles.routes";
import { userRoutes } from "./modules/users/users.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";
import { autoReturnExpiredBookings } from "./modules/jobs/autoReturnBookings";
import cron from "node-cron";

export const app = express();

app.use(express.json());

initDB();

const initCronJobs = () => {
  // Run every day at 12:01 AM
  cron.schedule("1 0 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running auto-return job...`);
    try {
      await autoReturnExpiredBookings();
      console.log(
        `[${new Date().toISOString()}] Auto-return job completed successfully`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Auto-return job failed:`,
        error
      );
    }
  });

  console.log("Cron jobs initialized");
};

// Initialize cron jobs
initCronJobs();

// Run once on startup (with delay to ensure DB is ready)
setTimeout(async () => {
  console.log("Running initial auto-return check...");
  try {
    await autoReturnExpiredBookings();
    console.log("Initial auto-return check completed");
  } catch (error) {
    console.error("Initial auto-return check failed:", error);
  }
}, 2000); // 2 second delay

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Health check / Welcome route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to vehicle rental system by TajUddin",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});
