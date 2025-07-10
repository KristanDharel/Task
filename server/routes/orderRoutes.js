import express from "express";
import {
  callWaiter,
  generateReceipt,
  getAllOrders,
  getKitchenOrders,
  placeOrder,
  updateOrderStatus,
} from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/orders", protect, placeOrder);
orderRouter.get("/getAllOrders", protect, getAllOrders);
orderRouter.put("/:orderId/call-waiter", callWaiter);
orderRouter.get("/:orderId/receipt", protect, generateReceipt);
orderRouter.put("/:orderId/status", updateOrderStatus);
orderRouter.put("/kitchen", getKitchenOrders);

export default orderRouter;
