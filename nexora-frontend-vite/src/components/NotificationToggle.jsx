import { useContext, useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Mail } from "lucide-react";

export default function NotificationToggle() {
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const active = user?.emailNotifications;

  const toggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await axios.put("/users/notifications");
      const updatedValue = res.data.emailNotifications;

      // ✅ SINGLE SOURCE OF TRUTH
      setUser((prev) => {
        const updatedUser = {
          ...prev,
          emailNotifications: updatedValue,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });
    } catch (err) {
      console.error("Failed to toggle notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={toggle}
      className={`flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm cursor-pointer transition ${
        isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-indigo-300"
      }`}
    >
      {/* ICON */}
      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
        <Mail className="w-5 h-5 text-indigo-600" />
      </div>

      {/* TEXT */}
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">
          Email Notifications
        </p>
        <p className="text-xs text-slate-400">
          Receive task updates via email
        </p>
      </div>

      {/* STATUS */}
      <span
        className={`text-xs font-bold ${
          active ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {active ? "ON" : "OFF"}
      </span>

      {/* TOGGLE */}
      <div
        className={`relative w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${
          active ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ x: active ? 20 : 0 }}
        />
      </div>
    </div>
  );
}
