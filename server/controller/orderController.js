import expressAsyncHandler from "express-async-handler";
import { Order, FoodItem, User, Table } from "../models/model.js";
import successResponse from "../successResponse.js";
import { HttpStatus } from "../constant.js";



export const placeOrder = expressAsyncHandler(async (req, res) => {
  const { items, tableNumber, paymentMethod, specialInstructions } = req.body;
  const userId = req.user._id;

  // Validate items
  if (!items || items.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Order must contain at least one item",
    });
  }

  // Validate table number
  if (!tableNumber) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Table number is required",
    });
  }

  try {
    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    // Verify all food items exist and are available
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `Food item ${item.foodItem} not found`,
        });
      }
      if (!foodItem.available) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `Food item ${foodItem.name} is not available`,
        });
      }

      totalAmount += foodItem.price * item.quantity;
      orderItems.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        quantity: item.quantity,
        priceAtOrder: foodItem.price,
        specialInstructions: item.specialInstructions || "",
      });
    }

    // Create the order
    const order = new Order({
      user: userId,
      items: orderItems,
      tableNumber,
      totalAmount,
      paymentMethod,
      specialInstructions,
      paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
      status: "pending", // Change from "completed" to "pending"
    });

    await order.save();

    // Update table status to "Order Placed"
    const table = await Table.findOneAndUpdate(
      { tableNumber },
      { status: "Order Placed", currentOrder: order._id },
      { new: true }
    );

    const io = req.app.get("io");
    
    // Emit order-created event to both admin and kitchen rooms
    const orderData = {
      orderId: order._id,
      tableNumber,
      items: orderItems,
      createdAt: order.createdAt,
      specialInstructions: specialInstructions || "",
    };

    // Debug log to see what's being sent
    console.log("Order data being sent to socket:", orderData);
    console.log("Special instructions:", specialInstructions);

    // Emit to admin room
    io.to("admin-room").emit("order-created", orderData);
    
    // Emit to kitchen room
    io.to("kitchen-room").emit("order-created", orderData);

    if (table) {
      // Emit table-updated event
      io.emit("table-updated", {
        tableId: table._id,
        status: "Order Placed",
        tableNumber: table.tableNumber,
        orderId: order._id,
      });
    }

    // Populate the response with more details
    const populatedOrder = await Order.findById(order._id)
      .populate("items.foodItem", "name description")
      .populate("user", "name email");

    successResponse(
      res,
      HttpStatus.CREATED,
      "Order placed successfully",
      populatedOrder
    );
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
});
export const getAllOrders = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId })
    .populate("items.foodItem")
    .sort({ createdAt: -1 });

  successResponse(
    res,
    HttpStatus.OK,
    "Order history retrieved successfully",
    orders
  );
});

export const callWaiter = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { waiterCalled: true },
    { new: true }
  ).populate("user", "name");

  if (!order) {
    let error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const io = req.app.get("io");
  io.to("admin-room").emit("waiter-called", {
    tableNumber: order.tableNumber,
    userId: order.user._id,
    userName: order.user.name,
  });

  successResponse(res, HttpStatus.OK, "Waiter has been notified", order);
});
export const generateReceipt = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("items.foodItem")
    .populate("user", "name email");

  if (!order) {
    let error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

 
  successResponse(res, HttpStatus.OK, "Receipt generated successfully", order);
});

export const updateOrderStatus = expressAsyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!order) {
    let error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  successResponse(
    res,
    HttpStatus.OK,
    "Order status updated successfully",
    order
  );
});

export const getKitchenOrders = expressAsyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .sort({ createdAt: -1 }); 
  
  successResponse(res, HttpStatus.OK, "All orders retrieved", orders);
});