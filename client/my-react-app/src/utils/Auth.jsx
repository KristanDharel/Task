import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUserFromStorage();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role ? user.role.toLowerCase() : null;
  const requiredRoles = Array.isArray(requiredRole)
    ? requiredRole.map((r) => r.toLowerCase())
    : [requiredRole.toLowerCase()];

  if (requiredRole && !requiredRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
