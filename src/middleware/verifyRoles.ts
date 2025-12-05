import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";
const verifyRoles = (...roles: ("admin" | "customer")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not authenticated",
        errors: "Token unavailable",
      });
    }
    const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
    const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      decoded.email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "user not found",
        errors: "user unavailable",
      });
    }

    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Unable to access",
        errors: "You are not authorized",
      });
    }
    next();
  };
};

export default verifyRoles;
