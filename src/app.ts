import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicles.routes";

export const app = express();

app.use(express.json());

initDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to vehicle rental system by TajUddin");
});
