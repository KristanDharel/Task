// controllers/paymentController.js
import expressAsyncHandler from "express-async-handler";
import { Order, Payment, FoodItem, Table } from "../models/model.js";
import { HttpStatus } from "../constant.js";

export const processPayment = expressAsyncHandler(async (req, res) => {
  const { orderId, paymentMethod, orderData } = req.body;
  const userId = req.user._id;

  if (!paymentMethod) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Payment method is required",
    });
  }

  if (!orderId && !orderData) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Either orderId or orderData is required",
    });
  }

  try {
    let order;
    const io = req.app.get("io");

    if (orderId) {
      order = await Order.findOne({
        _id: orderId,
        user: userId,
      }).populate("items.foodItem");

      if (!order) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Order not found",
        });
      }
    } 
    else if (orderData) {
      const { items, tableNumber, specialInstructions } = orderData;

      if (!items || items.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Order must contain at least one item",
        });
      }

      if (!tableNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Table number is required",
        });
      }

      let totalAmount = 0;
      const orderItems = [];

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

      order = new Order({
        user: userId,
        items: orderItems,
        tableNumber,
        totalAmount,
        paymentMethod,
        specialInstructions,
        paymentStatus: "pending",
        status: "pending",
      });

      await order.save();

      const table = await Table.findOneAndUpdate(
        { tableNumber },
        { status: "Order Placed", currentOrder: order._id },
        { new: true }
      );

      if (io) {
        if (table) {
          io.emit("table-updated", {
            tableId: table._id,
            status: "Order Placed",
            tableNumber: table.tableNumber,
            orderId: order._id,
          });
        }

        io.to("admin-room").emit("order-created", {
          tableNumber,
          items: orderItems,
          createdAt: order.createdAt,
          orderId: order._id,
        });
      }
      
      order = await Order.findById(order._id).populate("items.foodItem");
    }

    if (order.paymentStatus === "paid") {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Order already paid",
      });
    }

    const payment = new Payment({
      order: order._id,
      user: userId,
      amount: order.totalAmount,
      paymentMethod,
      status: "completed",
      paymentDetails: {
        paidAt: new Date(),
      },
    });

    await payment.save();

    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    order.status = "completed";
    await order.save();

    if (io) {
      console.log("Emitting payment-received event to admin-room");
      
      const paymentNotification = {
        tableNumber: order.tableNumber,
        amount: order.totalAmount,
        orderId: order._id,
        paymentId: payment._id,
        paymentMethod,
        paidAt: payment.paymentDetails.paidAt,
      };

      console.log("Payment notification data:", paymentNotification);

      io.to("admin-room").emit("payment-received", paymentNotification);
      
    } else {
      console.error("Socket.io instance not found");
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Payment processed successfully",
      payment,
      order,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
});

export const getPaymentDetails = expressAsyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId)
      .populate("order")
      .populate("user", "email phoneNumber");

    if (!payment) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch payment details",
    });
  }
});