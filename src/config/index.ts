import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  connection_str: process.env.PG_CONNECTION_STR,
  port: 5000
  // jwtSecret: process.env.JWT_SECRET,
};

export default config;