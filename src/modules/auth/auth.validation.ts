import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" }),

  email: z.email({ message: "Invalid email address" }),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" }),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, { message: "Phone number must be 10-15 digits" }),

  // No custom message - Zod provides a good default
  role: z.enum(["admin", "customer"]),
});

export const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type SignUpUser = z.infer<typeof signUpSchema>;
export type SignInUser = z.infer<typeof signInSchema>;
