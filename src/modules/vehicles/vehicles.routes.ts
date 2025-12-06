import { Router } from "express";
import { vehicleControllers } from "./vehicles.controller";
import verifyRoles from "../../middleware/verifyRoles";
import { Roles } from "../auth/auth.constant";

const router = Router();

router.post("/", verifyRoles(Roles.admin), vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getVehicles);
router.get("/:vehicleId", vehicleControllers.getVehicleById);

router.put(
  "/:vehicleId",
  verifyRoles(Roles.admin),
  vehicleControllers.updateVehicleById
);

router.delete(
  "/:vehicleId",
  verifyRoles(Roles.admin),
  vehicleControllers.deleteVehicleById
);

export const vehicleRoutes = router;
