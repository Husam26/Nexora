import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import NotificationToggle from "./NotificationToggle";
import { PLATFORM } from "../config/platform";
import { SERVICES } from "../config/services";
import { Users } from "lucide-react";

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

  useEffect(() => {
    setIsProfileOpen(false);
    setIsLauncherOpen(false);
  }, [location.pathname]);

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
        {/* ================= LOGO SECTION ================= */}
        <Link to="/" className="flex items-center gap-3 px-4 group">
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
            <span className="text-indigo-600">{PLATFORM.name.slice(-1)}</span>
          </h3>
        </Link>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {/* ================= NAVIGATION ================= */}
        <div className="flex items-center gap-1">
          <LayoutGroup>
            <Link
              to="/"
              className={`relative px-4 py-2 text-sm font-bold transition-colors ${
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
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>

            {user?.role === "admin" && (
              <Link
                to="/members"
                className={`relative px-4 py-2 text-sm font-bold transition-colors ${
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
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )}

            {isTaskApp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Link
                  to="/tasks"
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
                    location.pathname.startsWith("/tasks")
                      ? "text-indigo-600"
                      : "text-slate-500"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                  {location.pathname.startsWith("/tasks") && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            )}
          </LayoutGroup>
        </div>

        {/* ================= RIGHT ACTIONS ================= */}
        <div className="flex items-center gap-2 ml-4">
          {/* APP LAUNCHER */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLauncherOpen((p) => !p)}
              className={`p-2.5 rounded-xl transition-all ${
                isLauncherOpen
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {isLauncherOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setIsLauncherOpen(false)}
                  />
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.9,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.9,
                      filter: "blur(10px)",
                    }}
                    className="absolute right-0 mt-4 w-[340px] bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 z-[100]"
                  >
                    <div className="flex justify-between items-center mb-4 px-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ecosystem
                      </p>
                      <div className="h-1 w-8 bg-slate-100 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {visibleServices.map((service, idx) => (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: idx * 0.05 },
                          }}
                          onClick={() => {
                            navigate(service.route);
                            setIsLauncherOpen(false);
                          }}
                          disabled={service.status !== "active"}
                          className={`p-4 rounded-[1.5rem] border text-left transition-all group
                            ${
                              service.status === "active"
                                ? "bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
                                : "opacity-40 cursor-not-allowed bg-slate-50"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <service.icon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <p className="text-sm font-bold text-slate-800">
                            {service.name}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-1">
                            {service.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* NOTIFICATION */}
          {isTaskApp && user?.role === "employee" && (
            <div className="bg-slate-100 rounded-xl p-0.5">
              <NotificationToggle />
            </div>
          )}

          {/* PROFILE */}
          {user && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsProfileOpen((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-900 text-white shadow-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center font-bold text-xs border border-white/20">
                  {user.name?.charAt(0) || "U"}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 bg-slate-900 text-white rounded-[2rem] shadow-2xl overflow-hidden z-[100] border border-slate-800"
                  >
                    <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900">
                      <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-bold truncate">{user.email}</p>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">
                        {user.role}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
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
