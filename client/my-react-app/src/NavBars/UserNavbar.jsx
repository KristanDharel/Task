import { Link } from "react-router-dom";

const UserNavbar = () => {
  return (
    <nav className="bg-[#34C759] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Restaurant Menu</Link>
        <div className="flex space-x-4">
    
          <button onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }} className="hover:bg-purple-700 px-3 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;