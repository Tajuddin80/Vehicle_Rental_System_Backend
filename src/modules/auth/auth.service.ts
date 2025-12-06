import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import { ZodSignInUser, ZodSignUpUser } from "./auth.validation";
import config from "../../config";
import jwt from "jsonwebtoken";

const signUpUser = async (payload: ZodSignUpUser) => {
  const { name, email, password, phone, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING 
    id, name, email, phone, role `,
    [name, email, hashedPassword, phone, role]
  );
  return result;
};





const signInUser = async (payload: ZodSignInUser) => {
  const { email, password } = payload;

  const user = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (user.rows.length === 0) {
    throw new Error("User not Found!");
  }

  const matchedPassword = await bcrypt.compare(password, user.rows[0].password);

  if (!matchedPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.rows[0].id,
    name: user.rows[0].name,
    email: user.rows[0].email,
    phone: user.rows[0].phone,
    role: user.rows[0].role,
  };
  const token = jwt.sign(jwtPayload, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  return { token, user: jwtPayload };
};
export const authServices = {
  signUpUser,
  signInUser,
};
