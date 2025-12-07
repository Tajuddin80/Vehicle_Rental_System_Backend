import { pool } from "../../config/db";
import { ZodUpdateUser } from "./users.validation";

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT  id, name ,email, phone, role FROM users`
  );
  return result;
};

const deleteUserById = async (userId: string) => {
  // Check if user has any bookings
  const userBookings = await pool.query(
    `SELECT COUNT(*) as booking_count FROM bookings WHERE customer_id = $1`,
    [userId]
  );

  const bookingCount = parseInt(userBookings.rows[0].booking_count);

  // If user has bookings, throw an error
  if (bookingCount > 0) {
    throw new Error(
      `Cannot delete user. User has ${bookingCount} booking(s) associated with their account.`
    );
  }

  // If no bookings, proceed with deletion
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
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
