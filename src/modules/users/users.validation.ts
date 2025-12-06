import z from "zod";

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" }).optional(),

  email: z.email({ message: "Invalid email address" }).optional(),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" }).optional(),

 phone: z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, {
    message: "Phone number must be 10–15 digits and may start with +",
  })
  .optional(),

  // No custom message - Zod provides a good default
  role: z.enum(["admin", "customer"]).optional(),
});

export type ZodUpdateUser = z.infer<typeof updateUserSchema>;