import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("entrees");
  const [foodItems, setFoodItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tableNumber, setTableNumber] = useState("");
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

  const navigate = useNavigate();
  const categories = ["appetizer", "entrees", "sides", "dessert"];
  const BASE_URL = "http://localhost:8000";
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${BASE_URL}/foodItem/category/${activeCategory}`
        );

        if (response.data?.success && Array.isArray(response.data.result)) {
          setFoodItems(response.data.result);
        } else {
          setFoodItems([]);
          console.warn("Unexpected API response structure");
        }
      } catch (err) {
        console.error("Error fetching food items:", err);
        setError("Failed to load menu items");
        setFoodItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, [activeCategory]);

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find(
      (cartItem) => cartItem._id === item._id
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    toast.success(`${item.name} added to order`, {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleCallWaiter = async () => {
    if (!tableNumber) {
      toast.error("Please enter your table number first", {
        position: "bottom-center",
      });
      return;
    }

    setIsCallingWaiter(true);
    try {
      const response = await axios.post(`${BASE_URL}/waiter/call`, {
        tableNumber: parseInt(tableNumber),
      });

      if (response.data?.success) {
        toast.success(`Waiter called for table ${tableNumber}`, {
          position: "bottom-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error calling waiter:", error);
      toast.error(error.response?.data?.message || "Failed to call waiter", {
        position: "bottom-center",
      });
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${BASE_URL}/${imagePath}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  const filteredItems = foodItems.filter((item) => {
    if (!item || !item.name) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className=" pb-24">
      <h1 class="text-4xl font-bold">Menu Page</h1>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-500"></div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              placeholder="Table #"
              className="w-20 p-2 border border-gray-300 rounded-lg"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              min="1"
            />
            <button
              onClick={handleCallWaiter}
              disabled={isCallingWaiter}
              className={`px-4 py-2 rounded-lg ${
                isCallingWaiter
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-black"
              }`}
            >
              {isCallingWaiter ? "Calling..." : "Call Waiter"}
            </button>
            <button className="bg-green-500 px-4 py-2 rounded-lg hover:bg-gray-300">
              Receipt
            </button>
            <button
              className="bg-red-500 px-4 py-2 text-white rounded-lg hover:bg-gray-300"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 relative flex items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-full p-3 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 h-5 w-5"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 19L15.5001 15.5M18 9.5C18 14.1944 14.1944 18 9.5 18C4.80558 18 1 14.1944 1 9.5C1 4.80558 4.80558 1 9.5 1C14.1944 1 18 4.80558 18 9.5Z"
              stroke="#707070"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-3xl whitespace-nowrap border ${
                activeCategory === category
                  ? "bg-green-100 text-green-800 font-medium border-b-2 border-green-500"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          </h2>

          {filteredItems.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
              No items found in this category.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center"
                >
                  <div className="w-20 h-20 mr-4 flex-shrink-0">
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
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="font-bold">${item.price?.toFixed(2)}</p>
                    <button
                      className="mt-2 bg-green-500 text-black w-8 h-8  flex items-center justify-center"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-green-50 p-4 shadow-lg border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="font-medium">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} in Cart
              </div>
              <button
                className="bg-green-500 text-black px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => navigate("/order", { state: { cartItems } })}
              >
                View Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
