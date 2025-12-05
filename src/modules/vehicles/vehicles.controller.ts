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

    return res.status(200).json({
      success: true,
      message:
        result.rows.length === 0
          ? "No vehicles found"
          : "Vehicles retrieved successfully",
      data: result.rows || [],
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

const deleteVehicleById = async (req: Request, res: Response) => {};

export const vehicleControllers = {
  getVehicleById,
  createVehicle,
  getVehicles,
  updateVehicleById,
  deleteVehicleById,
};
