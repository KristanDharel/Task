import { Route, Routes } from "react-router-dom";
import AdminDashboard from "../AdminDashboard";
import Kitchen from "../component/kitchen/Kitchen";
import Login from "../component/Login";
import AddFoodForm from "../component/recption/AddFood";
import TableDashboard from "../component/recption/Dashboard";
import SignupForm from "../component/Register";
import MenuPage from "../component/user/Menu";
import OrderPage from "../component/user/OrderPage";
import PaymentPage from "../component/user/Payment";
import Layout from "../NavBars/Layout";
import ProtectedRoute from "../utils/Auth";
import Unauthorized from "../utils/Unauthorized";

const MyRoute = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<SignupForm />} />

      {/* <Route path="/" element={<MenuPage />} /> */}

      <Route
        path="/order"
        element={
          <ProtectedRoute
            requiredRole={["admin", "kitchen", "reception", "user"]}
          >
            <Layout>
              <OrderPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole={["user"]}>
            <Layout>
              <MenuPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute
            requiredRole={["admin", "kitchen", "reception", "user"]}
          >
            <Layout>
              <PaymentPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Other protected routes */}
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute requiredRole={["admin", "kitchen"]}>
            <Layout>
              <Kitchen />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole={["admin", "reception"]}>
            <Layout>
              <TableDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-food"
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AddFoodForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default MyRoute;
