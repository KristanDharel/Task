import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const fetchInitialOrders = async () => {
      try {
        const response = await fetch("http://localhost:8000/orders/kitchen", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(
            data.map((order) => ({
              id: order._id,
              tableNumber: order.tableNumber,
              items: order.items,
              time: new Date(order.createdAt),
              status: order.status,
              totalItems: order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              ),
              totalAmount: order.items.reduce(
                (sum, item) => sum + item.priceAtOrder * item.quantity,
                0
              ),
              specialInstructions: order.specialInstructions || "",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching initial orders:", error);
      }
    };

    fetchInitialOrders();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnectionStatus("connected");
      newSocket.emit("join-kitchen-room");
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    newSocket.on("connect_error", (error) => {
      setConnectionStatus("error");
    });

    newSocket.on("order-created", (data) => {
      setOrders((prev) => [
        {
          id: data.orderId,
          tableNumber: data.tableNumber,
          items: data.items,
          time: new Date(data.createdAt),
          status: "pending",
          totalItems: data.items.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: data.items.reduce(
            (sum, item) => sum + item.priceAtOrder * item.quantity,
            0
          ),
          specialInstructions: data.specialInstructions || "",
        },
        ...prev,
      ]);
    });

    newSocket.on("order-updated", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const formatTimeAgo = (notificationTime) => {
    const diffInMilliseconds = currentTime - notificationTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const undoComplete = async (orderId, originalStatus) => {
    try {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: originalStatus } : order
        )
      );

      const response = await fetch(
        `http://localhost:8000/order/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: originalStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to undo completion");
      }

      toast.success("Order status reverted successfully");
    } catch (error) {
      console.error("Error undoing completion:", error);
      toast.error("Failed to revert order status");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const originalOrders = [...orders];
      const orderToUpdate = orders.find((order) => order.id === orderId);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      const response = await fetch(
        `http://localhost:8000/order/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        if (newStatus === "completed") {
      
          toast.custom(
            (t) => (
              <div
                className={`
        ${t.visible ? "animate-enter" : "animate-leave"}
        bg-[#E0F5E0] shadow-lg rounded-lg pointer-events-auto flex items-center
        fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
        w-full max-w-md
        border border-green-200
      `}
                style={{
                  width: "90%",
                  maxWidth: "400px",
                }}
              >
                <div className="flex items-center p-4 w-full">
                  <div className="flex-shrink-0 mr-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-green-600"
                    >
                      <path
                        d="M9 12L11 14L15 10M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Table{" "}
                      {orderToUpdate.tableNumber.toString().padStart(2, "0")}{" "}
                      Order Completed!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      undoComplete(orderId, orderToUpdate.status);
                      toast.dismiss(t.id);
                    }}
                    className="ml-4 px-3 py-1 rounded-md text-sm font-medium text-[#337544] hover:bg-green-100 transition-colors"
                  >
                    Undo
                  </button>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-center",
            }
          );
        }
      } else {
        setOrders(originalOrders);
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300 opacity-75";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (b.status === "pending" && a.status !== "pending") return 1;

      if (a.status === "preparing" && b.status === "completed") return -1;
      if (b.status === "preparing" && a.status === "completed") return 1;

      return b.time - a.time;
    });
  };

  if (showOrderDetails && selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="">
          <button
            onClick={closeOrderDetails}
            className="text-red-500 hover:text-red-400 text-2xl items-end fixed top-30 right-4 z-50"
          >
            ×
          </button>
        </div>

        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Table {selectedOrder.tableNumber.toString().padStart(2, "0")}
                </h2>
                <p className="text-gray-600">
                  Order Time: {formatTimeAgo(selectedOrder.time)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>
            </div>

            {selectedOrder.specialInstructions && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Order Special Instructions
                </h3>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ⚠️ {selectedOrder.specialInstructions}
                  </p>
                </div>
              </div>
            )}

         
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 bg-[#FFFBF5] rounded-lg"
                  >
                    <div className="flex-1 mr-4">
                      {" "}
                      <div className="flex flex-col">
                        {" "}
                        <h4 className="font-medium text-gray-800 text-left">
                          {item.name}
                        </h4>{" "}
                        {item.specialInstructions && (
                          <p className="text-sm text-[#34C759] mt-1 text-left">
                            {" "}
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {" "}
                      <p className="font-semibold whitespace-nowrap">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600 whitespace-nowrap">
                        ${item.priceAtOrder.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Items:</span>
                <span>{selectedOrder.totalItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3 flex-col">
              <div className="mb-2">
                <p className="text-gray-600">
                  Estimated Time Given to the customer: 45 mins
                </p>
              </div>
              <div className="flex gap-3">
                {selectedOrder.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "preparing")
                      }
                      className="flex-1 py-3 bg-[#E7F8DD] text-black rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Start Preparing
                    </button>
                    <button
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, "completed")
                      }
                      className="flex-1 py-3 bg-[#34C759] text-black rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  </>
                )}
                {selectedOrder.status === "preparing" && (
                  <button
                    onClick={() =>
                      updateOrderStatus(selectedOrder.id, "completed")
                    }
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                {selectedOrder.status === "completed" && (
                  <div className="flex-1 py-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                    Order Completed ✓
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />

      <div className="container mx-auto p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          sortOrders(orders).map((order) => (
            <div
              key={order.id}
              className={`bg-white p-4 rounded-lg shadow flex ${
                order.status === "completed" ? "opacity-80" : ""
              }`}
            >
              <div
                className="flex items-center justify-center mr-4"
                style={{
                  backgroundColor: "#FFE5B4",
                  borderRadius: "8px",
                  minWidth: "60px",
                  height: "60px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <span className="text-xl font-bold text-gray-800">
                  {order.tableNumber.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">
                    {order.status === "completed"
                      ? "Completed Order"
                      : "New Order"}{" "}
                    - {order.totalItems} items
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="mr-1">Order placed:</span>
                  <span>{formatTimeAgo(order.time)}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Items:</span>{" "}
                    {order.totalItems} |
                    <span className="font-medium"> Total:</span> $
                    {order.totalAmount.toFixed(2)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="px-4 py-2 bg-[#34C759] text-black rounded-lg"
                  >
                    View Order
                  </button>

                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Start Preparing
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Mark Complete
                      </button>
                    </>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Kitchen;
