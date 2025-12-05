import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { signInSchema, signUpSchema } from "./auth.validation";
import { ZodError } from "zod";

const signUpUser = async (req: Request, res: Response) => {
  try {
    const validatedData = signUpSchema.parse(req.body);

    const result = await authServices.signUpUser(validatedData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
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
      message: error.message || "Failed to create user",
    });
  }
};

const signInUser = async (req: Request, res: Response) => {
  try {
    const validatedData = signInSchema.parse(req.body);

    const result = await authServices.signInUser(validatedData);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token: result.token, user: result.user },
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
      message: error.message || "Failed to login user",
    });
  }
};
export const authControllers = {
  signUpUser,
  signInUser,
};
