import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPaymentDetails,
  processPayment,
} from "../controller/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/process", protect, processPayment);
paymentRouter.get("/:paymentId", protect, getPaymentDetails);

export default paymentRouter;
