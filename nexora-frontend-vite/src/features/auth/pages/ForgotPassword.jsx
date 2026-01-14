import { useState } from "react";
import axios from "../../../api/axios";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { PLATFORM } from "../../../config/platform";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Grid */}
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
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-10 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Account Recovery
          </span>

          <h2 className="text-4xl font-black text-slate-900 mt-4">
            Reset your{" "}
            <span className="text-indigo-600">Password</span>
          </h2>

          <p className="text-slate-500 mt-3 font-medium">
            We’ll send a reset link to your registered email
          </p>
        </div>

        {/* Content */}
        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <p className="text-green-600 font-black text-lg">
              Reset link sent successfully!
            </p>
            <p className="text-slate-500 font-medium text-sm">
              Please check your inbox (and spam folder)
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 w-5 h-5" />
              <input
                type="email"
                required
                placeholder="Work Email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-black transition-all"
            >
              {loading ? (
                "Sending reset link..."
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5 text-indigo-400" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-slate-400 mt-10 text-sm font-bold">
          Remember your password?{" "}
          <a
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 transition-colors underline-offset-4 hover:underline"
          >
            Back to Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
