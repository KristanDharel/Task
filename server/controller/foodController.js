// controllers/foodController.js
import expressAsyncHandler from "express-async-handler";
import { FoodItem, Order, User } from "../models/model.js";
import successResponse from "../successResponse.js";
import { HttpStatus } from "../constant.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

export const addFoodItem = expressAsyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;
  const image = req.file ? req.file.path : null;

  if (!image) {
    let error = new Error("Image is required");
    error.statusCode = 400;
    throw error;
  }

  const foodItem = await FoodItem.create({
    name,
    description,
    price,
    category,
    image
  });

  successResponse(
    res,
    HttpStatus.CREATED,
    "Food item added successfully",
    foodItem
  );
});

export const getAllFoodItems = expressAsyncHandler(async (req, res) => {
  const foodItems = await FoodItem.find({ available: true });
  successResponse(
    res,
    HttpStatus.OK,
    "Food items retrieved successfully",
    foodItems
  );
});

export const getFoodItemsByCategory = expressAsyncHandler(async (req, res) => {
  const { category } = req.params;
  const foodItems = await FoodItem.find({ category, available: true });
  successResponse(
    res,
    HttpStatus.OK,
    "Food items retrieved successfully",
    foodItems
  );
});

export const updateFoodItem = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  if (req.file) {
    updates.image = req.file.path;
  }

  const updatedItem = await FoodItem.findByIdAndUpdate(id, updates, { new: true });
  
  if (!updatedItem) {
    let error = new Error("Food item not found");
    error.statusCode = 404;
    throw error;
  }

  successResponse(
    res,
    HttpStatus.OK,
    "Food item updated successfully",
    updatedItem
  );
});

export const deleteFoodItem = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedItem = await FoodItem.findByIdAndUpdate(
    id,
    { available: false },
    { new: true }
  );

  if (!deletedItem) {
    let error = new Error("Food item not found");
    error.statusCode = 404;
    throw error;
  }

  successResponse(
    res,
    HttpStatus.OK,
    "Food item deleted successfully",
    deletedItem
  );
});