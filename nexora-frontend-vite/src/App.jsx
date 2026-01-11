import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ServiceProvider } from "./context/ServiceContext";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import TaskDashboard from "./pages/TaskManager/TaskDashboard";
import InvoiceDashboard from "./pages/SmartInvoice/InvoiceDashboard";
import CreateInvoice from "./pages/SmartInvoice/CreateInvoice";
import InvoiceDetail from "./pages/SmartInvoice/InvoiceDetail";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import MembersPage from "./pages/MembersPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import SmartEmail from "./pages/Emailautomation/SmartEmail";

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

/* 🚀 Root App */
export default function App() {
  return (
    <AuthProvider>
      <ServiceProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </ServiceProvider>
    </AuthProvider>
  );
}
