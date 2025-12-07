import { z } from "zod";

export const bookingSchema = z
  .object({
    customer_id: z.number({
      message: "customer_id must be a number",
    }),
    vehicle_id: z.number({
      message: "vehicle_id must be a number",
    }),

    rent_start_date: z.coerce.date().refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "Rent start date cannot be in the past",
      }
    ),
    rent_end_date: z.coerce.date().refine((date) => date > new Date(), {
      message: "Rent end date must be greater than today's date",
    }),
  })
  .refine((data) => data.rent_end_date > data.rent_start_date, {
    message: "Rent end date must be after rent start date",
    path: ["rent_end_date"],
  });

export const updateBookingSchema = z.object({
  status: z.enum(["cancelled", "returned"]),
});

export type ZodBookingSchema = z.infer<typeof bookingSchema>;
export type ZodUpdatingSchema = z.infer<typeof updateBookingSchema>;
