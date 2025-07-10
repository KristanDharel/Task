import { Router } from "express";
import {
  createTable,
  getAllTables,
  getTableById,
  getTableStatus,
  updateTableStatus,
} from "../controller/receptionController.js";

const receptionRoute = Router();
receptionRoute.route("/tables").get(getAllTables);
receptionRoute.route("/stats").get(getTableStatus);
receptionRoute.route("/:id").get(getTableById);
receptionRoute.route("/:id/status").patch(updateTableStatus);
receptionRoute.route("/create").post(createTable);
export default receptionRoute;
