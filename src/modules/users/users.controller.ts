import { Request, Response } from "express";
import { userServices } from "./users.service";
import { ZodError } from "zod";
import { updateUserSchema } from "./users.validation";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userServices.getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users.rows || [],
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
      message: error.message || "Failed to retrieve Users ",
    });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user Id not Provided",
      });
    }
    const result = await userServices.deleteUserById(userId as string);

    if (result.rowCount) {
      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Given user id isn't available or already been deleted",
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
      message: error.message || "Failed to delete user",
    });
  }
};

const updateUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not provided",
      });
    }

    // Validate request body
    const validatedData = updateUserSchema.parse(req.body);

    // Get the requester's ID from JWT
    const requesterId = req.user?.id;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "User information not found in token",
      });
    }

    // Pass both target userId and requester ID to service
    const result = await userServices.updateUserById(
      userId,
      validatedData,
      requesterId
    );

    if (result.rowCount && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
      message: error.message || "Failed to update user",
    });
  }
};

export const userControllers = {
  getAllUsers,
  deleteUserById,
  updateUserById,
};
