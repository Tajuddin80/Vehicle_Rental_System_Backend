import { z } from "zod";

export const createVehicleSchema = z.object({
  vehicle_name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" }),

  type: z.enum(["car", "bike", "van", "SUV"]),

  registration_number: z.string(),

  daily_rent_price: z
    .number({ message: "daily_rent_price must be a number" })
    .min(1, { message: "daily_rent_price must be positive at least 1" }),

  availability_status: z.enum(["available", "booked"]),
});

export const updateVehicleSchema = z.object({
  vehicle_name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" }).optional(),

  type: z.enum(["car", "bike", "van", "SUV"]).optional(),

  registration_number: z.string().optional(),

  daily_rent_price: z
    .number({ message: "daily_rent_price must be a number" })
    .min(1, { message: "daily_rent_price must be positive at least 1" }).optional(),

  availability_status: z.enum(["available", "booked"]).optional(),
});

export type ZodCreateVehicle = z.infer<typeof createVehicleSchema>;
export type ZodUpdateVehicle = z.infer<typeof updateVehicleSchema>;
