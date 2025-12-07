// src/modules/jobs/autoReturnBookings.ts
import { pool } from "../../config/db";

export const autoReturnExpiredBookings = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update bookings that have passed their end date
    const updatedBookings = await client.query(
      `
      UPDATE bookings 
      SET status = 'returned'
      WHERE status = 'active' 
      AND rent_end_date < CURRENT_DATE
      RETURNING vehicle_id
      `
    );

    if (updatedBookings.rows.length > 0) {
      // Update vehicles to 'available' only if no other active bookings exist
      await client.query(
        `
        UPDATE vehicles 
        SET availability_status = 'available'
        WHERE id IN (
          SELECT DISTINCT vehicle_id FROM bookings WHERE status = 'returned'
        )
        AND NOT EXISTS (
          SELECT 1 FROM bookings b 
          WHERE b.vehicle_id = vehicles.id 
          AND b.status = 'active'
        )
        `
      );

      console.log(` Auto-returned ${updatedBookings.rows.length} booking(s)`);
    } else {
      console.log("No expired bookings to return");
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(" Auto-return job failed:", error);
    throw error;
  } finally {
    client.release();
  }
};
