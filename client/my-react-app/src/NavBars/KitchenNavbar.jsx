import { Link } from "react-router-dom";

const KitchenNavbar = () => {
  return (
    <nav className="bg-[#34C759] text-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/kitchen" className="text-xl font-bold">Kitchen Dashboard</Link>
        <div className="flex space-x-4">
          <Link to="/kitchen" className="hover:bg-green-700 px-3 py-2 rounded">Orders</Link>
          <button onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }} className="hover:bg-green-700 px-3 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default KitchenNavbar;