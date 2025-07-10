import mongoose from "mongoose";

const waiterCallSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "responded", "completed"],
      default: "pending"
    },
    callTime: {
      type: Date,
      default: Date.now
    },
    responseTime: Date,
    completedTime: Date,
    notes: String
  },
  { timestamps: true }
);

export const WaiterCall = mongoose.model("WaiterCall", waiterCallSchema);