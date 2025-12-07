import { string } from "zod";
import { pool } from "../../config/db";
import { vehicleServices } from "../vehicles/vehicles.service";
import { ZodBookingSchema } from "./booking.validation";

const createBooking = async (payload: ZodBookingSchema) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get and validate vehicle
    const vehicle_info = await vehicleServices.getVehicleById(
      String(payload.vehicle_id)
    );
    if (!vehicle_info.rows[0]) {
      throw new Error("Vehicle not found");
    }
    if (vehicle_info.rows[0].availability_status !== "available") {
      throw new Error("Vehicle is not available already booked by someone");
    }

    // 2. Check availability
    const checkAvailability = await client.query(
      `
      SELECT id FROM bookings 
      WHERE vehicle_id = $1 
      AND status = 'active'
      AND (
        (rent_start_date <= $2 AND rent_end_date >= $2) OR
        (rent_start_date <= $3 AND rent_end_date >= $3) OR
        (rent_start_date >= $2 AND rent_end_date <= $3)
      )
      `,
      [payload.vehicle_id, payload.rent_start_date, payload.rent_end_date]
    );

    if (checkAvailability.rows.length > 0) {
      throw new Error("Vehicle is not available for the selected dates");
    }

    // 3. Calculate price
    const start = new Date(payload.rent_start_date);
    const end = new Date(payload.rent_end_date);
    const number_of_days =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const total_price = number_of_days * vehicle_info.rows[0].daily_rent_price;

    // 4. Insert booking
    const insertBookingResult = await client.query(
      `
      INSERT INTO bookings (
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        payload.customer_id,
        payload.vehicle_id,
        payload.rent_start_date,
        payload.rent_end_date,
        total_price,
        "active",
      ]
    );

    // 5. Update vehicle status
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [payload.vehicle_id]
    );

    await client.query("COMMIT");

    const booking = insertBookingResult.rows[0];

    // Return combined response
    return {
      id: booking.id,
      customer_id: booking.customer_id,
      vehicle_id: booking.vehicle_id,
      rent_start_date: booking.rent_start_date,
      rent_end_date: booking.rent_end_date,
      total_price: booking.total_price,
      status: booking.status,
      vehicle: {
        vehicle_name: vehicle_info.rows[0].vehicle_name,
        daily_rent_price: vehicle_info.rows[0].daily_rent_price,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAllBookings = async (userId?: number, role?: string) => {
  let query = `
    SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      u.name AS customer_name,
      u.email AS customer_email,
      v.vehicle_name,
      v.registration_number,
      v.type
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
  `;

  const params: any[] = [];

  // Filter by customer if role is customer
  if (role === "customer" && userId) {
    query += " WHERE b.customer_id = $1";
    params.push(userId);
  }

  query += " ORDER BY b.id ASC";

  const result = await pool.query(query, params);
  return result.rows;
};

const updateBookingbyId = async (
  bookingId: string,
  validatedData: { status: "cancelled" | "returned" },
  userId: number,
  userRole: string
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get the booking
    const bookingResult = await client.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // 2. Authorization checks based on role and status
    if (validatedData.status === "cancelled") {
      // Only customers can cancel
      if (userRole !== "customer") {
        throw new Error("Only customers can cancel bookings");
      }

      // Customer can only cancel their own booking
      if (booking.customer_id !== userId) {
        throw new Error("You are not authorized to cancel this booking");
      }

      // Can only cancel before start date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(booking.rent_start_date);
      startDate.setHours(0, 0, 0, 0);

      if (startDate <= today) {
        throw new Error("Cannot cancel booking on or after start date");
      }

      // Update booking to cancelled
      const updateResult = await client.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        ["cancelled", bookingId]
      );

      await client.query("COMMIT");
      return updateResult.rows[0];
    } else if (validatedData.status === "returned") {
      // Only admins can mark as returned
      if (userRole !== "admin") {
        throw new Error("Only admins can mark bookings as returned");
      }

      // Update booking status
      const updateResult = await client.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        ["returned", bookingId]
      );

      // Update vehicle status to available
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );

      // Get updated vehicle info
      const vehicleResult = await client.query(
        `SELECT availability_status FROM vehicles WHERE id = $1`,
        [booking.vehicle_id]
      );

      await client.query("COMMIT");

      return {
        ...updateResult.rows[0],
        vehicle: {
          availability_status: vehicleResult.rows[0].availability_status,
        },
      };
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  updateBookingbyId,
};
