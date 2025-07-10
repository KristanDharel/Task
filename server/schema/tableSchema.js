import { Schema } from "mongoose";

const tableSchema = Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["Empty", "Occupied", "To Clean", "Order Placed"],
    default: "Empty",
  },
  capacity: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});
export default tableSchema;
