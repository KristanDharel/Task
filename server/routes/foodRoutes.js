import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  addFoodItem,
  deleteFoodItem,
  getAllFoodItems,
  getFoodItemsByCategory,
  updateFoodItem,
  upload,
} from "../controller/foodController.js";

const foodRouter = express.Router();

foodRouter.post(
  "/addFood",

  upload.single("image"),
  addFoodItem
);
foodRouter.get("/allFoods", getAllFoodItems);
foodRouter.get("/category/:category", getFoodItemsByCategory);
foodRouter.put("/:id", protect, admin, upload.fields("image"), updateFoodItem);

foodRouter.delete("/:id", protect, admin, deleteFoodItem);

export default foodRouter;
