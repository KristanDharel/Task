
import express, { json } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDb from "./config/connectDB.js";
import userRouter from "./routes/userRoutes.js";
import receptionRoute from "./routes/recptionRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import foodRouter from "./routes/foodRoutes.js";
import path from "path";
import paymentRouter from "./routes/paymentRouter.js";
import waiterRouter from "./routes/waiterRouter.js";

const expressApp = express();

expressApp.use(cors());
expressApp.use(json());

const server = http.createServer(expressApp);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("join-admin-room", () => {
    socket.join("admin-room");
    console.log("Admin joined admin room");
  });

  socket.on("join-kitchen-room", () => {
    socket.join("kitchen-room");
    console.log("Kitchen staff joined kitchen room");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

expressApp.set("io", io);
expressApp.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
connectDb();
expressApp.use("/users", userRouter);
expressApp.use("/table", receptionRoute);
expressApp.use("/order", orderRouter);
expressApp.use("/foodItem", foodRouter);
expressApp.use("/payment", paymentRouter);
expressApp.use("/waiter", waiterRouter);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});