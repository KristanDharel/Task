import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useEffect } from "react";
import io from "socket.io-client";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState({});

  // Base URL for your backend server
  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const socket = io("http://localhost:8000"); // Adjust to your backend URL

    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${BASE_URL}/${imagePath}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      const updatedItems = cartItems.filter((item) => item._id !== id);
      setCartItems(updatedItems);
      setShowInstructions((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast.info("Item removed from order");
    } else {
      setCartItems(
        cartItems.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const toggleInstructions = (itemId) => {
    setShowInstructions((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleInstructionChange = (itemId, instruction) => {
    setCartItems(
      cartItems.map((item) =>
        item._id === itemId
          ? { ...item, specialInstructions: instruction }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add items to your order");
      return;
    }

    if (!tableNumber || tableNumber.trim() === "") {
      toast.error("Please enter a table number");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          foodItem: item._id,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || "",
        })),
        tableNumber: parseInt(tableNumber),
        total: calculateTotal(),
      };

      const response = await axios.post(
        "http://localhost:8000/order/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Order placed successfully! Redirecting to payment...");
        // Navigate to payment page after a short delay
        setTimeout(() => {
          navigate("/payment", {
            state: {
              orderDetails: response.data.order,
              cartItems,
              tableNumber,
              subtotal: calculateTotal(),
              tax: (calculateTotal() * 0.1).toFixed(2),
              total: (calculateTotal() * 1.1).toFixed(2),
            },
          });
        }, 2000);
      } else {
        toast.error(
          "Failed to place order: " + (response.data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Order error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("You don't have permission to place orders.");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Your Order is Empty</h2>
        <p className="text-gray-600 mb-6">
          You haven't added any items to your order yet.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
 <h1 class="text-4xl font-bold">Order Page</h1>

    
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="p-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 mr-4 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center">
                      <button
                        className="w-8 h-8 bg-[#34C759] text-white border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="mx-3 font-medium">{item.quantity}</span>
                      <button
                        className="w-8 h-8 bg-[#34C759] text-white border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <button
                      onClick={() => toggleInstructions(item._id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      <svg
                        width="24"
                        height="17"
                        viewBox="0 0 24 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_10_4474)">
                          <path
                            d="M20 19V16H7C5.34315 16 4 17.3431 4 19M8.8 22H16.8C17.9201 22 18.4802 22 18.908 21.782C19.2843 21.5903 19.5903 21.2843 19.782 20.908C20 20.4802 20 19.9201 20 18.8V5.2C20 4.07989 20 3.51984 19.782 3.09202C19.5903 2.71569 19.2843 2.40973 18.908 2.21799C18.4802 2 17.9201 2 16.8 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22Z"
                            stroke="#707070"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12.5 5V12M9 8.5H16"
                            stroke="#707070"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_10_4474">
                            <rect width="24" height="17" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <span className="text-sm">Add Note</span>
                    </button>

                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {showInstructions[item._id] && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions for {item.name}
                      </label>
                      <textarea
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Any special requests for this item?"
                        value={item.specialInstructions || ""}
                        onChange={(e) =>
                          handleInstructionChange(item._id, e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label
            htmlFor="tableNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Table Number *
          </label>
          <input
            type="number"
            id="tableNumber"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter your table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />
        </div>

        <div className="bg-[#DFF7E5] p-4 rounded-lg shadow-sm mb-6">
          <h3 className="font-bold mb-3">Order Summary</h3>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${calculateTotal()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax (10%):</span>
            <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
          </div>
           <div className="flex space-x-4">
          <button
            onClick={() => {
              setCartItems([]);
              toast.info("Order cleared");
            }}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Clear Order
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg ${
              isSubmitting
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-[#34C759] text-black"
            }`}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
        </div>

       
      </div>
    </div>
  );
};

export default OrderPage;
