import express from "express";
import { callWaiter, completeCall, getActiveCalls, respondToCall } from "../controller/waiterController.js";


const router = express.Router();

router.post("/call", callWaiter);
router.put("/respond/:callId", respondToCall);
router.put("/complete/:callId", completeCall);
router.get("/active", getActiveCalls);

export default router;
