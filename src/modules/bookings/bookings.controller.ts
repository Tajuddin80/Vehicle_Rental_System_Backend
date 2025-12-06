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
const getAllBookings = async (req: Request, res: Response) => {};
const updateBookingbyId = async (req: Request, res: Response) => {};

export const bookingControllers = {
  createBooking,
  getAllBookings,
  updateBookingbyId,
};
