import { string } from "zod";
import { pool } from "../../config/db";
import { vehicleServices } from "../vehicles/vehicles.service";
import { ZodBookingSchema } from "./booking.validation";

// const createBooking = async (payload: ZodBookingSchema) => {
//   // 1. Get and validate vehicle
//   const vehicle_info = await vehicleServices.getVehicleById(
//     String(payload.vehicle_id)
//   );
//   if (!vehicle_info.rows[0]) {
//     throw new Error("Vehicle not found");
//   }
//   if (vehicle_info.rows[0].availability_status !== "available") {
//     throw new Error("Vehicle is not available already booked by someone");
//   }

//   // Add this to bookingServices.createBooking before inserting:
//   const checkAvailability = await pool.query(
//     `
//   SELECT id FROM bookings 
//   WHERE vehicle_id = $1 
//   AND status = 'active'
//   AND (
//     (rent_start_date <= $2 AND rent_end_date >= $2) OR
//     (rent_start_date <= $3 AND rent_end_date >= $3) OR
//     (rent_start_date >= $2 AND rent_end_date <= $3)
//   )
//   `,
//     [payload.vehicle_id, payload.rent_start_date, payload.rent_end_date]
//   );

//   if (checkAvailability.rows.length > 0) {
//     throw new Error("Vehicle is not available for the selected dates");
//   }

//   // 3. Calculate price
//   const start = new Date(payload.rent_start_date);
//   const end = new Date(payload.rent_end_date);
//   const number_of_days =
//     (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
//   const total_price = number_of_days * vehicle_info.rows[0].daily_rent_price;

//   const daily_rent_price = vehicle_info.rows[0].daily_rent_price;
//   const status = "active";
//   // Insert booking
//   const insertBookingResult = await pool.query(
//     `
//     INSERT INTO bookings (
//       customer_id,
//       vehicle_id,
//       rent_start_date,
//       rent_end_date,
//       total_price,
//       status
//     )
//     VALUES ($1, $2, $3, $4, $5, $6)
//     RETURNING *
//     `,
//     [
//       payload.customer_id,
//       payload.vehicle_id,
//       payload.rent_start_date,
//       payload.rent_end_date,
//       total_price,
//       status,
//     ]
//   );

//   // Update vehicle status to 'booked'
//   await vehicleServices.updateVehicleById(String(payload.vehicle_id), {
//     availability_status: "booked",
//   });

//   const booking = insertBookingResult.rows[0];

//   // Return combined response
//   return {
//     id: booking.id,
//     customer_id: booking.customer_id,
//     vehicle_id: booking.vehicle_id,
//     rent_start_date: booking.rent_start_date,
//     rent_end_date: booking.rent_end_date,
//     total_price: booking.total_price,
//     status: booking.status,
//     vehicle: {
//       vehicle_name: vehicle_info.rows[0].vehicle_name,
//       daily_rent_price: daily_rent_price,
//     },
//   };
// };


const createBooking = async (payload: ZodBookingSchema) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

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
    const number_of_days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
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

    await client.query('COMMIT');

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
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};






const getAllBookings = async (userId: string) => {

// const userRole = 




};
const updateBookingbyId = async () => {};

export const bookingServices = {
  createBooking,
  getAllBookings,
  updateBookingbyId,
};
