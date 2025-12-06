import { Request, Response } from "express";
import { ZodError } from "zod";
import { bookingSchema } from "./booking.validation";
import { bookingServices } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const validatedData = bookingSchema.parse(req.body);

    const result = await bookingServices.createBooking(validatedData);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      // Just return your custom messages
      const messages = error.issues.map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};
const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getAllBookings();
    const userRole = req.user?.role;

    if (userRole === "admin") {
      const formattedForAdmin = result.rows.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,

        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },

        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: formattedForAdmin,
      });
    } else {
      const customerId = req.user?.id;

      const customerBookings = result.rows.filter(
        (row) => row.customer_id === customerId
      );

      const formattedForCustomer = customerBookings.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,

        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
          type: row.type,
        },
      }));

      return res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: formattedForCustomer,
      });
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      // Just return your custom messages
      const messages = error.issues.map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};
const updateBookingbyId = async (req: Request, res: Response) => {};

export const bookingControllers = {
  createBooking,
  getAllBookings,
  updateBookingbyId,
};
