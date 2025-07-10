import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
export let verifyToken = async (token) => {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error("Invalid token format");
    }

    console.log("Token Payload:", decoded.payload);

    const infoObj = jwt.verify(token, process.env.SECRET_KEY, {
      algorithms: ["HS256"], //prevents tampering of token
    });

    return infoObj;
  } catch (error) {
    console.error("Token Verification Detailed Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    // Differentiate error types
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token signature");
    }

    throw error;
  }
};
export let generateToken = expressAsyncHandler(async (infoObj, expireInfo) => {
  let token = await jwt.sign(infoObj, process.env.SECRET_KEY, expireInfo);
  return token;
});
