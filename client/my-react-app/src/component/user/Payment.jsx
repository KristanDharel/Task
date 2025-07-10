import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get order details from navigation state
  const orderDetails = location.state?.orderDetails;
  const cartItems = location.state?.cartItems || [];
  const tableNumber = location.state?.tableNumber;
  const subtotal = location.state?.subtotal || "0.00";
  const tax = location.state?.tax || "0.00";
  const total = location.state?.total || "0.00";

  const BASE_URL = "http://localhost:8000";

  // Debug logging
  console.log("Payment page loaded with:", {
    orderDetails,
    cartItems,
    tableNumber,
    subtotal,
    tax,
    total,
  });

  useEffect(() => {
    // Redirect if no order details
    if (!orderDetails && !cartItems.length) {
      console.log("No order details found, redirecting to menu");
      toast.error("No order details found. Please place an order first.");
      navigate("/");
    }
    if (!cartItems.length) {
      console.log("No items in cart, redirecting to menu");
      toast.error("No items to pay for. Please add items to your order first.");
      navigate("/");
    }
  }, [orderDetails, cartItems, navigate]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Please login to complete payment");
        navigate("/login");
        return;
      }

      // Prepare payment request data
      const paymentData = {
        paymentMethod: "card",
      };

      // If we have orderDetails, use the existing order
      if (orderDetails && orderDetails._id) {
        paymentData.orderId = orderDetails._id;
      }
      // If we don't have orderDetails but have cartItems, send order data
      else if (cartItems.length > 0) {
        paymentData.orderData = {
          items: cartItems.map((item) => ({
            foodItem: item._id,
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions || "",
          })),
          tableNumber,
          specialInstructions: "", // Add any general order instructions if needed
        };
      } else {
        throw new Error("No valid order information available");
      }

      console.log("Sending payment data:", paymentData);

      // Process payment (which will create order if needed)
      const paymentResponse = await axios.post(
        `${BASE_URL}/payment/process`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (paymentResponse.data.success) {
        toast.success("Payment successful! Your order is being prepared.");
        setTimeout(() => {
          navigate("/", {
            state: {
              paymentDetails: paymentResponse.data.payment,
              orderDetails: paymentResponse.data.order,
              cartItems,
              tableNumber,
              total,
            },
          });
        }, 1500);
      } else {
        throw new Error(paymentResponse.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to process payment. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };
  if (!orderDetails && !cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p className="text-gray-600">
          If this persists, please go back to menu and try again.
        </p>
        <button
          onClick={() => navigate("/menu")}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
   
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Order Receipt
          </h2>

          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Item</span>
            <div className="flex space-x-8">
              <span className="text-gray-600 font-medium">Qty</span>
              <span className="text-gray-600 font-medium">Price</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {cartItems.map((item, index) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 font-medium text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-gray-800 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-8">
                  <span className="text-gray-800 font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <span className="text-gray-800 font-medium w-16 text-right">
                    $ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Table Number: </span>
            <span className="text-gray-800 font-bold">{tableNumber}</span>
          </div>
        </div>

        <div className="bg-[#DFF7E5] p-6 rounded-b-lg">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>$ {subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (10%):</span>
              <span>$ {tax}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-300">
              <span>Total: $ {total}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            All the prices are inclusive of VAT
          </p>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#34C759] hover:bg-[#2db653] active:bg-[#28a745]"
            }`}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>

      <div className="mx-4 mt-4 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Payment Methods</h3>
        <p className="text-sm text-gray-600">
          We accept all major credit cards, debit cards, and digital payment
          methods. Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
