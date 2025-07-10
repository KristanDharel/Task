import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const TableDashboard = () => {
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState({
    Empty: 0,
    Occupied: 0,
    "To Clean": 0,
    "Order Placed": 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: 4,
    status: "Empty",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChange, setPendingChange] = useState({
    tableId: null,
    newStatus: null,
  });
  const statusColors = {
    Empty: "#BDDBBD",
    "To Clean": "#E6B2B2",
    "Order Placed": "#E6E6B2",
    Occupied: "#BDBDDB",
  };

  // useEffect(() => {
  //   fetchTables();
  //   fetchStats();
  // }, []);
  useEffect(() => {
    const socket = io("http://localhost:8000"); 

    socket.on("table-updated", (data) => {
      toast.info(`Table ${data.tableNumber} status updated to ${data.status}`);
      fetchTables(); 
      fetchStats(); 
    });

    socket.on("table-created", (newTable) => {
      toast.success(`New table ${newTable.tableNumber} created`);
      fetchTables();
      fetchStats();
    });

    fetchTables();
    fetchStats();

    return () => {
      socket.disconnect();
    };
  }, []);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8000/table/tables");
      setTables(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to fetch tables");
      setTables([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:8000/table/stats");
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch stats");
    }
  };

 
  const handleStatusChange = async (tableId, newStatus) => {
    setPendingChange({ tableId, newStatus });
    setShowConfirmModal(true);
  };
  const confirmStatusChange = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/table/${pendingChange.tableId}/status`,
        {
          status: pendingChange.newStatus,
        }
      );
      toast.success(`Table status updated to ${pendingChange.newStatus}`);
      fetchTables();
      fetchStats();
    } catch (error) {
      toast.error("Failed to update table status");
    } finally {
      setShowConfirmModal(false);
      setPendingChange({ tableId: null, newStatus: null });
    }
  };
  const handleCreateTable = async () => {
    try {
      await axios.post("http://localhost:8000/table/create", newTable);
      toast.success(`Table ${newTable.tableNumber} created successfully`);
      fetchTables();
      fetchStats();
      setShowCreateModal(false);
      setNewTable({
        tableNumber: "",
        capacity: 4,
        status: "Empty",
      });
    } catch (error) {
      toast.error("Failed to create table");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Restaurant Table Management
      </h1>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
        </h1>
        <button
          className="bg-red-500 px-4 py-2 text-white rounded-lg hover:bg-gray-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Occupied</h3>
          <p
            className="text-2xl font-bold"
            style={{ color: statusColors["Occupied"] }}
          >
            {stats.Occupied}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Empty</h3>
          <p
            className="text-2xl font-bold"
            style={{ color: statusColors["Empty"] }}
          >
            {stats.Empty}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">To Clean</h3>
          <p
            className="text-2xl font-bold"
            style={{ color: statusColors["To Clean"] }}
          >
            {stats["To Clean"]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {tables.length > 0 ? (
          tables.map((table) => (
            <div
              key={table._id}
              className="bg-white p-4 rounded-lg shadow flex"
              style={{ backgroundColor: statusColors[table.status] }}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Table {table.tableNumber.toString().padStart(2, "0")}
                </h3>
                <p className="text-lg">
                  <span className="font-semibold">Status:</span> {table.status}
                </p>
                {/* <p className="text-sm">
                  <span className="font-semibold">Capacity:</span>{" "}
                  {table.capacity}
                </p> */}
              </div>
              <div className="ml-2 flex items-center">
                <select
                  value={table.status}
                  onChange={(e) =>
                    handleStatusChange(table._id, e.target.value)
                  }
                  className="p-1 border rounded text-sm"
                  style={{ backgroundColor: "#FFFFFF4D" }}
                >
                  {Object.keys(statusColors).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No tables available
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Create New Table
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create New Table</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Table Number:</label>
              <input
                type="number"
                value={newTable.tableNumber}
                onChange={(e) =>
                  setNewTable({ ...newTable, tableNumber: e.target.value })
                }
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Capacity:</label>
              <input
                type="number"
                value={newTable.capacity}
                onChange={(e) =>
                  setNewTable({
                    ...newTable,
                    capacity: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Initial Status:
              </label>
              <select
                value={newTable.status}
                onChange={(e) =>
                  setNewTable({ ...newTable, status: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                {Object.keys(statusColors).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-end justify-center z-50">
          <div
            className="bg-white p-6 rounded-t-3xl
 shadow-lg w-full max-w-md animate-slide-up"
          >
            <h2 className="text-xl font-bold mb-4">Change Status?</h2>
            <p className="mb-4 text-gray-600">
              This will clear any orders or receipt present in the table
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-[#5DD57B] text-black rounded hover:bg-[#4ac96c]"
              >
                Change Status
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#DFF7E5] text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableDashboard;
