import { useContext, useState, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import NotificationToggle from "../ui/NotificationToggle";
import { PLATFORM } from "../../config/platform";
import { SERVICES } from "../../config/services";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const visibleServices = SERVICES.filter((service) => {
    if (service.adminOnly && user?.role !== "admin") return false;
    return true;
  });

  const isTaskApp = location.pathname.startsWith("/tasks");

  // ✅ Centralized navigation (closes dropdowns safely)
  const handleNavigate = useCallback(
    (path) => {
      setIsProfileOpen(false);
      setIsLauncherOpen(false);
      navigate(path);
    },
    [navigate]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed top-4 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none">
      <motion.nav
        layout
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto flex items-center gap-2 p-2 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2rem] max-w-7xl w-fit"
      >
        {/* LOGO */}
        <Link
          to="/"
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-3 px-4 group"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-lg"
          >
            <span className="text-white font-black text-xl italic">
              {PLATFORM.logoLetter}
            </span>
          </motion.div>
          <h3 className="hidden sm:block text-lg font-bold tracking-tight text-slate-800">
            {PLATFORM.name.slice(0, -1)}
            <span className="text-indigo-600">
              {PLATFORM.name.slice(-1)}
            </span>
          </h3>
        </Link>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {/* NAVIGATION */}
        <div className="flex items-center gap-1">
          <LayoutGroup>
            <Link
              to="/"
              onClick={() => handleNavigate("/")}
              className={`relative px-4 py-2 text-sm font-bold ${
                location.pathname === "/"
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Home
              {location.pathname === "/" && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                />
              )}
            </Link>

            {user?.role === "admin" && (
              <Link
                to="/members"
                onClick={() => handleNavigate("/members")}
                className={`relative px-4 py-2 text-sm font-bold ${
                  location.pathname === "/members"
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Members
                {location.pathname === "/members" && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                  />
                )}
              </Link>
            )}

            {isTaskApp && (
              <Link
                to="/tasks"
                onClick={() => handleNavigate("/tasks")}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                />
              </Link>
            )}
          </LayoutGroup>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 ml-4">
          {/* APP LAUNCHER */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLauncherOpen((p) => !p)}
              className={`p-2.5 rounded-xl ${
                isLauncherOpen
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {isLauncherOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute right-0 mt-4 w-[340px] bg-white rounded-[2.5rem] shadow-2xl p-5 z-[100]"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {visibleServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleNavigate(service.route)}
                        disabled={service.status !== "active"}
                        className="p-4 rounded-2xl border text-left hover:shadow-lg"
                      >
                        <service.icon className="w-5 h-5 text-indigo-600 mb-2" />
                        <p className="text-sm font-bold">{service.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {service.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NOTIFICATION */}
          {isTaskApp && user?.role === "employee" && (
            <NotificationToggle />
          )}

          {/* PROFILE */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen((p) => !p)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0) || "U"}
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-slate-900 text-white rounded-2xl shadow-xl"
                  >
                    <div className="p-4">
                      <p className="text-sm font-bold">{user.email}</p>
                      <p className="text-xs text-indigo-400 uppercase">
                        {user.role}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="inline w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.nav>
    </div>
  );
}
