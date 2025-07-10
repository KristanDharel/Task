import expressAsyncHandler from "express-async-handler";
import { User } from "../models/model.js";
import { generateToken } from "../config/token.js";
import { hashPassword } from "../Utils/hashing.js";
import successResponse from "../successResponse.js";
import { HttpStatus } from "../constant.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const createUser = expressAsyncHandler(async (req, res) => {
  let data = req.body;
  let user = await User.findOne({ email: data.email });
  if (user) {
    let error = new Error("Duplicate email");
    error.statusCode = 409;
    throw error;
  } else {
    let hashedPassword = await hashPassword(data.password);
    data.password = hashedPassword;
    let result = await User.create(data);
    delete result._doc.password; 
    let infoObj = {
      id: result._id,
      role: result.role,
    };
    let expireInfo = {
      expiresIn: "300d",
    };
    let token = await generateToken(infoObj, expireInfo);
    console.log(token);
    successResponse(
      res,
      HttpStatus.CREATED,
      "User created successfully",
      result
    );
  }
});
export const userLogin = async (req, res, next) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findOne({
      email: email,
    });
    if (user) {
      let validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        let infoObj = {
          _id: user._id,
          role: user.role,
        };
        let expireInfo = {
          expiresIn: "300d",
        };
        let token = await jwt.sign(infoObj, process.env.SECRET_KEY, expireInfo);
        res.json({
          success: true,
          message: "user login successful.",
          data: user,
          token: token,
        });
      }
    } else {
      let error = new Error("Password not valid.");
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const readUserById = async (req, res, next) => {
  try {
    let id = req.params.id; 

    let result = await User.findById(id);
    res.json({
      success: true,
      message: "Read all users",
      data: result,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
export const processPayment = expressAsyncHandler(async (req, res) => {

  if (payment) {
    const io = req.app.get("io");
    io.to("admin-room").emit("payment-received", {
      tableNumber: order.tableNumber,
      amount: payment.amount,
      orderId: order._id,
    });

  }
});
