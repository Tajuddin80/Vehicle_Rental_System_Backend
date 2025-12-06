import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicles.routes";
import { userRoutes } from "./modules/users/users.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";

export const app = express();

app.use(express.json());

initDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes );
app.use("/api/v1/bookings", bookingRoutes );

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to vehicle rental system by TajUddin");
});
