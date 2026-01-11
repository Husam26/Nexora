import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { PLATFORM } from "../../config/platform";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/auth/signup", form);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48L54 6L6 6L6 54L54 54L54 48Z' fill='none' stroke='%234F46E5' stroke-width='2'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-xl border border-white p-10 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Workspace Setup
          </span>

          <h2 className="text-4xl font-black text-slate-900 mt-4">
            Create your <span className="text-indigo-600">Workspace</span>
          </h2>

          <p className="text-slate-500 mt-3 font-medium">
            Start managing your team with {PLATFORM.name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 w-5 h-5" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
              placeholder="Full Name"
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 w-5 h-5" />
            <input
              type="email"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
              placeholder="Work Email"
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
              placeholder="Password"
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              "Creating Workspace..."
            ) : (
              <>
                Create Workspace{" "}
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 mt-8 text-sm font-bold">
          Already have a workspace?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </motion.div>
    </div>
  );
}
