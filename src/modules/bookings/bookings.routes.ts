import { Router } from "express";
import { bookingControllers } from "./bookings.controller";
import { Roles } from "../auth/auth.constant";
import verifyRoles from "../../middleware/verifyRoles";

const router = Router();
router.post(
  "/",
  verifyRoles(Roles.admin, Roles.customer),
  bookingControllers.createBooking
);
router.get(
  "/",
  verifyRoles(Roles.admin, Roles.customer),
  bookingControllers.getAllBookings
);
// router.put('/:bookingId', bookingControllers.updateBookingbyId)

export const bookingRoutes = router;
