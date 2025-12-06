import { Router } from "express";
import verifyRoles from "../../middleware/verifyRoles";
import { Roles } from "../auth/auth.constant";
import { userControllers } from "./users.controller";

const router = Router();

router.get("/", verifyRoles(Roles.admin), userControllers.getAllUsers);

router.put(
  "/:userId",
  verifyRoles(Roles.admin, Roles.customer),
  userControllers.updateUserById
);

router.delete(
  "/:userId",
  verifyRoles(Roles.admin),
  userControllers.deleteUserById
);

export const userRoutes = router;
