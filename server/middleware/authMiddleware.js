
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { User } from "../models/model.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
  let token;

  console.log("Auth headers:", req.headers.authorization); 

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);
      
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("Decoded token:", decoded); 
      
      let userId = decoded._id || decoded.id;
      console.log("User ID from token:", userId); 
      
      req.user = await User.findById(userId).select("-password");
      console.log("User found in database:", req.user); 
      
      if (!req.user) {
        console.log("No user found with ID:", userId); 
        res.status(401);
        throw new Error("User not found");
      }
      
      next();
    } catch (error) {
      console.error("Token verification error:", error); 
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.log("No Bearer token found"); 
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

export const waiter = (req, res, next) => {
  if (req.user && (req.user.role === "waiter" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a waiter or admin");
  }
};