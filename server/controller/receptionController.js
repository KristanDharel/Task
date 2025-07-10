import { Table } from "../models/model.js";

export const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort("tableNumber");
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status, lastUpdated: Date.now() },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const io = req.app.get("io");
    io.emit("table-updated", {
      tableId: table._id,
      status: table.status,
      tableNumber: table.tableNumber,
    });

    res.status(200).json({
      message: "Table status updated successfully",
      table,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status } = req.body;
    const table = new Table({
      tableNumber,
      capacity,
      status: status || "Empty",
    });

    await table.save();

    const io = req.app.get("io");
    io.emit("table-created", table);

    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getTableStatus = async (req, res) => {
  try {
    const stats = await Table.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      Empty: 0,
      Occupied: 0,
      "To Clean": 0,
      "Order Placed": 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
