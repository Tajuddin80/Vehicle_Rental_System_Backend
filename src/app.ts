import express, { Request, Response } from "express";
import initDB from "./config/db";

export const app = express();

app.use(express.json());

initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to vehicle rental system by TajUddin");
});
