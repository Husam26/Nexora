import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import {
  Search,
  Plus,
  Trash2,
  FileText,
  Receipt,
  ArrowUpRight,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useService } from "../../context/ServiceContext";
import { motion, AnimatePresence } from "framer-motion";
import InvoiceChatBot from "../../components/InvoiceChatBot";


const statusStyles = {
  pending:
    "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  paid: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  overdue:
    "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
};

export default function InvoiceDashboard() {
  const { setActiveService } = useService();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setActiveService("invoice");
  }, [setActiveService]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirm = window.confirm(
      "Are you sure you want to delete this invoice?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      alert("Failed to delete invoice");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const customerName = inv.customer?.name || "";
    const matchesSearch = customerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Quick Stats for the HUD
  const totalVolume = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const paidVolume = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20 pt-28 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER & STATS HUD ================= */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Financial Ledger
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Invoices<span className="text-indigo-600">.</span>
            </h1>
          </motion.div>

          {/* Quick HUD */}
          <div className="flex gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                Total Volume
              </p>
              <p className="text-xl font-black text-slate-900">
                ₹{(totalVolume / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl shadow-sm hidden md:block">
              <p className="text-[10px] font-black text-emerald-600/60 uppercase mb-1">
                Settled
              </p>
              <p className="text-xl font-black text-emerald-600">
                ₹{(paidVolume / 1000).toFixed(1)}k
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/invoices/create")}
              className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-bold shadow-2xl transition-all"
            >
              <Plus className="w-5 h-5 text-indigo-400" />
              Create Invoice
            </motion.button>
          </div>
        </header>

        {/* ================= CONTROLS BAR ================= */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-24 z-30">
          <div className="flex-1 flex items-center bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] px-6 py-2 shadow-xl shadow-slate-200/40">
            <Search size={20} className="text-slate-400" />
            <input
              className="w-full p-3 bg-transparent outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="Search Invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] px-2 py-2 shadow-xl shadow-slate-200/40">
            <Filter size={16} className="ml-4 text-slate-400" />
            <select
              className="bg-transparent rounded-xl p-3 text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Logs</option>
              <option value="pending">Pending</option>
              <option value="paid">Settled</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* ================= LEDGER LIST ================= */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Retrieving Logs
                </p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-white rounded-[3rem] border border-slate-100"
              >
                <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">
                  No transactions found matching filters.
                </p>
              </motion.div>
            ) : (
              filteredInvoices.map((inv, idx) => (
                <motion.div
                  key={inv._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: idx * 0.05 },
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => navigate(`/invoices/${inv._id}`)}
                  className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-500"
                >
                  {/* Status Side Ribbon */}
                  <div
                    className={`absolute left-0 top-8 bottom-8 w-1 rounded-r-full transition-all group-hover:top-4 group-hover:bottom-4 ${
                      inv.status === "paid"
                        ? "bg-emerald-500"
                        : inv.status === "pending"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />

                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        Billed To
                      </p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {inv.customer?.name || "Private Client"}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Settlement
                      </p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                        ₹{inv.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Maturity
                      </p>
                      <p className="text-sm font-bold text-slate-600">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center justify-end">
                      <span
                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border transition-all ${
                          statusStyles[inv.status]
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.role === "admin" && (
                      <button
                        onClick={(e) => handleDelete(e, inv._id)}
                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div className="p-3 text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      <InvoiceChatBot />
    </div>
  );
}