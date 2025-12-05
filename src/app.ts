import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";

export const app = express();

app.use(express.json());

initDB();


app.use('/api/v1/auth', authRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to vehicle rental system by TajUddin");
});
