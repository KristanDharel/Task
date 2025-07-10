import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [currentTime, setCurrentTime] = useState(new Date());

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
      newSocket.emit("join-admin-room");
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    newSocket.on("connect_error", (error) => {
      setConnectionStatus("error");
    });

    newSocket.on("waiter-called", (data) => {
      setNotifications((prev) => [
        {
          type: "waiter",
          tableNumber: data.tableNumber,
          time: new Date(),
          id: Date.now(),
          status: "needs-attention",
        },
        ...prev,
      ]);
    });

    newSocket.on("order-created", (data) => {
      setNotifications((prev) => [
        {
          type: "order",
          tableNumber: data.tableNumber,
          quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
          amount: data.items.reduce(
            (sum, item) => sum + item.priceAtOrder * item.quantity,
            0
          ),
          time: new Date(data.createdAt),
          id: Date.now(),
          status: "new-order",
        },
        ...prev,
      ]);
    });

    newSocket.on("payment-received", (data) => {
      setNotifications((prev) => [
        {
          type: "payment",
          tableNumber: data.tableNumber,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          time: new Date(data.paidAt),
          id: Date.now(),
          status: "payment-complete",
        },
        ...prev,
      ]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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

  const statusColors = {
    "needs-attention": "#FFEBEE",
    "new-order": "#E3F2FD",
    "payment-complete": "#E8F5E9",
  };

  return (
    <div className="min-h-screen bg-gray-100">
  
      <div className="container mx-auto p-4 space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No new notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white p-4 rounded-lg shadow flex"
            >
              <div
                className="flex items-center justify-center mr-4"
                style={{
                  backgroundColor: "#E6E6B2",
                  borderRadius: "8px",
                  minWidth: "60px",
                  height: "60px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <span className="text-xl font-bold text-gray-800">
                  {notification.tableNumber.toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold mb-1">
                    {notification.type === "waiter" && "Waiter Called"}
                    {notification.type === "order" && "New Order Placed"}
                    {notification.type === "payment" && "Payment Received"}
                  </h3>
                  <button
                    onClick={() => clearNotification(notification.id)}
                    className="text-gray-500 hover:text-gray-700 text-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-1">Received</span>
                  <span>{formatTimeAgo(notification.time)}</span>
                </div>

                {notification.type === "order" && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Items:</span>{" "}
                      {notification.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> $
                      {notification.amount.toFixed(2)}
                    </p>
                  </div>
                )}

                {notification.type === "payment" && (
                  <p className="text-sm">
                    <span className="font-medium">Paid:</span> $
                    {notification.amount.toFixed(2)} via{" "}
                    {notification.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
