import { pool } from "../../config/db";
import { ZodUpdateUser } from "./users.validation";

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT  id, name ,email, phone, role FROM users`
  );
  return result;
};

const deleteUserById = async (userId: string) => {
  const result = await pool.query(`DELETE FROM users WHERE id= $1`, [userId]);
  return result;
};

const updateUserById = async (
  targetId: string, 
  payload: Record<string, any>, 
  requesterId: string | number
) => {
  // Check if requester has permission
  const requesterQuery = await pool.query(
    `SELECT role FROM users WHERE id = $1`, 
    [requesterId]
  );

  if (requesterQuery.rows.length === 0) {
    throw new Error("Requester not found");
  }

  const requesterRole = requesterQuery.rows[0].role;
  const isAdmin = requesterRole === "admin";
  const isOwnProfile = targetId === requesterId.toString();

  // Only allow update if:
  // 1. User is admin, OR
  // 2. User is updating their own profile
  if (!isAdmin && !isOwnProfile) {
    throw new Error("You can only update your own profile");
  }

  const fields = Object.keys(payload);
  const values = Object.values(payload);

  if (fields.length === 0) {
    throw new Error("No fields provided to update");
  }

  const setQuery = fields
    .map((field, idx) => `${field} = $${idx + 1}`)
    .join(", ");

  const sql = `
    UPDATE users 
    SET ${setQuery}
    WHERE id = $${fields.length + 1}
    RETURNING id, name, email, phone, role;
  `;

  const result = await pool.query(sql, [...values, targetId]);

  return result;
};

export const userServices = {
  getAllUsers,
  deleteUserById,
  updateUserById,
};
