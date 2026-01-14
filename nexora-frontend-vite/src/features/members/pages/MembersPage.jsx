import { useEffect, useState, useContext } from "react";
import axios from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import CreateMember from "../components/AddMember";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  RefreshCcw, 
  Users, 
  ShieldCheck, 
  Mail, 
  Fingerprint,
  UserPlus
} from "lucide-react";

export default function MembersPage() {
  const { user, token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users/admin-members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchMembers();
  }, [user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20 pt-32 px-6 lg:px-12">
      <main className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Team Management</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Directory<span className="text-indigo-600">.</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-3">
             <motion.button
              whileHover={{ rotate: 180 }}
              onClick={fetchMembers}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            >
              <RefreshCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              {isAdding ? "Close Panel" : "Invite Member"}
            </motion.button>
          </div>
        </header>

        {/* --- ADD MEMBER DRAWER --- */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <CreateMember />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MEMBERS GRID/TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Active Personnel</h2>
             <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">
                {members.length} Total
             </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Syncing Directory...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members.map((m, idx) => (
                    <motion.tr 
                      key={m._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight">{m.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {m._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Mail className="w-4 h-4 text-slate-300" />
                          {m.email}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          m.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {m.role}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}