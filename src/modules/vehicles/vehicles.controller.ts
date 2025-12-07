import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "./vehicles.validation";
import { vehicleServices } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const validatedData = createVehicleSchema.parse(req.body);

    const result = await vehicleServices.createVehicle(validatedData);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
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
      message: error.message || "Failed to create vehicle",
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicles();
    if (result.rowCount! > 0) {
      return res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: result.rows || [],
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: result.rows || [],
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
      message: error.message || "Failed to get vehicles",
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params?.vehicleId;

    const result = await vehicleServices.getVehicleById(vehicleId as string);

    return res.status(200).json({
      success: true,
      message:
        result.rows.length === 1
          ? "Vehicle retrieved successfully"
          : "No vehicle found with the ID",
      data: result.rows.length === 1 ? result.rows[0] : [],
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
      message: error.message || "Failed to get vehicle",
    });
  }
};

const updateVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params?.vehicleId;
    // Check if body has any keys
    const isBodyEmpty = !req.body || Object.keys(req.body).length === 0;

    if (!vehicleId || isBodyEmpty) {
      return res.status(400).json({
        success: false,
        message: "Both vehicle ID and updated body are required!",
      });
    }

    const validatedData = updateVehicleSchema.parse(req.body);

    const result = await vehicleServices.updateVehicleById(
      vehicleId as string,
      validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
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
      message: error.message || "Failed to update vehicle",
    });
  }
};

const deleteVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params?.vehicleId;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID not provided",
      });
    }

    const result = await vehicleServices.deleteVehicleById(vehicleId as string);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result, // ✅ Add this
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const messages = error.issues.map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        errors: messages,
      });
    }

    // Handle specific business logic errors
    if (error.message.includes("Cannot delete vehicle")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Vehicle not found") {
      // ✅ Capitalized for consistency
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or already deleted",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete vehicle",
    });
  }
};

export const vehicleControllers = {
  getVehicleById,
  createVehicle,
  getVehicles,
  updateVehicleById,
  deleteVehicleById,
};
