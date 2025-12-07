import { Request, Response } from "express";
import { ZodError } from "zod";
import { bookingSchema, updateBookingSchema } from "./booking.validation";
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
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Fetch bookings based on role
    const bookings = await bookingServices.getAllBookings(userId, userRole);

    if (userRole === "admin") {
      // Admin view: includes customer info
      const formattedForAdmin = bookings.map((row) => ({
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
      // Customer view: NO customer_id, includes vehicle type
      const formattedForCustomer = bookings.map((row) => ({
        id: row.id,
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
        message: "Your bookings retrieved successfully",
        data: formattedForCustomer,
      });
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve bookings",
    });
  }
};

const updateBookingbyId = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params?.bookingId;
    const userId = req.user?.id; // From auth middleware
    const userRole = req.user?.role; // From auth middleware (e.g., 'customer' or 'admin')

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required.",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required.",
      });
    }

    const validatedData = updateBookingSchema.parse(req.body);

    // Pass user info to service for authorization
    const result = await bookingServices.updateBookingbyId(
      bookingId,
      validatedData,
      userId,
      userRole
    );

    // Dynamic message based on status
    const message =
      validatedData.status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((issue) => issue.message);
      return res.status(400).json({
        success: false,
        errors: messages,
      });
    }

    // Handle business logic errors with appropriate status codes
    const statusCode = error.message.includes("not found")
      ? 404
      : error.message.includes("not authorized") ||
        error.message.includes("only cancel")
      ? 403
      : error.message.includes("cannot cancel")
      ? 400
      : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update booking",
    });
  }
};

export const bookingControllers = {
  createBooking,
  getAllBookings,
  updateBookingbyId,
};
