import { Link } from "react-router-dom";

const ReceptionNavbar = () => {
  return (
    <nav className="bg-#34C759 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">Reception Dashboard</Link>
        <div className="flex space-x-4">
          <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">Tables</Link>
          <Link to="/add-food" className="hover:bg-blue-700 px-3 py-2 rounded">Add Food</Link>
          <button onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }} className="hover:bg-blue-700 px-3 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ReceptionNavbar;