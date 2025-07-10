import expressAsyncHandler from "express-async-handler";
import { WaiterCall } from "../schema/waiterSchema.js";
import { HttpStatus } from "../constant.js";

export const callWaiter = expressAsyncHandler(async (req, res) => {
  const { tableNumber } = req.body;

  if (!tableNumber) {
    const error = new Error("Table number is required");
    error.statusCode = 400;
    throw error;
  }

  const waiterCall = await WaiterCall.create({
    tableNumber,
    status: "pending"
  });

  const io = req.app.get("io");
  io.to("admin-room").emit("waiter-called", {
    callId: waiterCall._id,
    tableNumber: waiterCall.tableNumber,
    timestamp: waiterCall.callTime
  });

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Waiter has been notified",
    data: {
      callId: waiterCall._id,
      tableNumber: waiterCall.tableNumber
    }
  });
});

export const respondToCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  
  const waiterCall = await WaiterCall.findByIdAndUpdate(
    callId,
    { 
      status: "responded",
      responseTime: new Date() 
    },
    { new: true }
  );

  if (!waiterCall) {
    const error = new Error("Waiter call not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Waiter call marked as responded",
    data: waiterCall
  });
});

export const completeCall = expressAsyncHandler(async (req, res) => {
  const { callId } = req.params;
  
  const waiterCall = await WaiterCall.findByIdAndUpdate(
    callId,
    { 
      status: "completed",
      completedTime: new Date() 
    },
    { new: true }
  );

  if (!waiterCall) {
    const error = new Error("Waiter call not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(HttpStatus.OK).json({
    success: true,
    message: "Waiter call marked as completed",
    data: waiterCall
  });
});

export const getActiveCalls = expressAsyncHandler(async (req, res) => {
  const activeCalls = await WaiterCall.find({ status: "pending" })
    .sort({ callTime: 1 });

  res.status(HttpStatus.OK).json({
    success: true,
    data: activeCalls
  });
});