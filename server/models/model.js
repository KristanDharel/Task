import { model } from "mongoose";
import {
  foodItemSchema,
  orderSchema,
  paymentSchema,
  userSchema,
} from "../schema/userSchema.js";
import tableSchema from "../schema/tableSchema.js";

export let User = model("User", userSchema);
export let Table = model("Table", tableSchema);
export let FoodItem = model("FoodItem", foodItemSchema);
export let Order = model("Order", orderSchema);
export let Payment = model("Payment", paymentSchema);
