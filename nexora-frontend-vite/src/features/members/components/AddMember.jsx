import { useState, useContext } from "react";
import axios from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Key, Copy, Check, Fingerprint } from "lucide-react";

export default function AddMember() {
  const { user, token } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", role: "employee" });
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitHandler = async (e) => {
  e.preventDefault();
  if (!user || user.role !== "admin") return;

  setLoading(true);
  try {
    const res = await axios.post(
      "/users/create-member",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTempPassword(res.data.loginDetails.password);
    setForm({ name: "", email: "", role: "employee" });

    // ❌ do NOT close panel automatically
  } catch (err) {
    alert(err.response?.data?.msg || "Error creating member");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white border border-indigo-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/5">
      
      {/* FORM SIDE */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Member Profile</h2>
        <p className="text-slate-400 font-medium mb-8">Define access levels for new workspace personnel.</p>
        
        <form onSubmit={submitHandler} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
            <input
              type="email"
              placeholder="Workspace Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none appearance-none transition-all font-bold text-slate-700"
            >
              <option value="employee">Team Member (Employee)</option>
              <option value="admin">Admin Access</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Register Member"}
          </motion.button>
        </form>
      </div>

      {/* CREDENTIALS CARD SIDE */}
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!tempPassword ? (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center p-10 border-2 border-dashed border-slate-100 rounded-[2rem] w-full"
            >
              <Fingerprint className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-sm">Credentials will be generated<br/>upon registration.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="card"
              initial={{ scale: 0.9, opacity: 0, rotateY: 20 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              className="bg-slate-900 w-full rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <Key className="w-8 h-8 text-indigo-400 mb-6" />
                <h3 className="text-lg font-black uppercase tracking-widest text-indigo-200 mb-1">Temporary Access</h3>
                <p className="text-xs text-slate-400 mb-8 font-medium">Please share these details securely with the user.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Password Directive</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono tracking-tighter">{tempPassword}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />
                  Security Protocol Active
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}