import { Router } from "express";
import {
  createUser,
  readUserById,
  userLogin,
} from "../controller/userController.js";

const userRouter = Router();
userRouter
  .route("/userRegistration")

  .post(createUser)
  .get(readUserById);
userRouter.route("/userLogin").post(userLogin);
export default userRouter;
