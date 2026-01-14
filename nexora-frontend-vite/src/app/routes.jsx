import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import Navbar from "../components/layout/Navbar";

import Home from "../features/analytics/Home";
import TaskDashboard from "../features/tasks/pages/TaskDashboard";
import InvoiceDashboard from "../features/invoices/pages/InvoiceDashboard";
import CreateInvoice from "../features/invoices/pages/CreateInvoice";
import InvoiceDetail from "../features/invoices/pages/InvoiceDetail";
import Login from "../features/auth/pages/Login";
import Signup from "../features/auth/pages/Signup";
import MembersPage from "../features/members/pages/MembersPage";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import SmartEmail from "../features/analytics/SmartEmail";

/* 🔒 Private Route */
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
};

/* 🌐 Layout */
function AppLayout() {
  const location = useLocation();

  // Navbar should NOT appear on these routes
  const hideNavbarRoutes = ["/login", "/signup","/forgot-password", "/reset-password/:token"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TaskDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <InvoiceDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/create"
          element={
            <PrivateRoute>
              <CreateInvoice />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/:id"
          element={
            <PrivateRoute>
              <InvoiceDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/members"
          element={
            <PrivateRoute>
              <AdminRoute>
                <MembersPage />
              </AdminRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/automation/smart-email"
          element={
            <PrivateRoute>
              <SmartEmail />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default AppLayout;