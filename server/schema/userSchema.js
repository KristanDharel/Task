import mongoose, { Schema } from "mongoose";
export let userSchema = Schema(
  {
    phoneNumber: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin", "reception", "kitchen"],
      default: "user",
    },
  },
  { timestamps: true }
);
export const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ["appetizer", "entrees", "sides", "dessert", "beverage"],
      required: true,
    },
    image: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);



export const orderItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  quantity: { type: Number, default: 1 },
  priceAtOrder: { type: Number, required: true },
  specialInstructions: { type: String, default: "" }, 
});

export const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    tableNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    waiterCalled: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      required: false,
    },
    specialInstructions: { type: String, default: "" }, // General order instructions
  },
  { timestamps: true }
);
export const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    paymentDetails: Object,
  },
  { timestamps: true }
);
