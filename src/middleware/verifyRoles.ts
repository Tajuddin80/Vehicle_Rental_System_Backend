import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";

const verifyRoles = (...roles: ("admin" | "customer")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      return res
        .status(401)
        .json({ success: false, message: "No 'Bearer <token>' provided" });
    }

    const token = bearerToken.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please provide 'Bearer <token>'",
        errors: "Unauthorized access",
      });
    }
    const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
    const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      decoded.email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "not authorizd user",
        errors: "Don't have access to this route",
      });
    }

    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Unable to access",
        errors: "Forbidden access",
      });
    }
    next();
  };
};

export default verifyRoles;
