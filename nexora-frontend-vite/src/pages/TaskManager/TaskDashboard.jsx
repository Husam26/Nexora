import { useEffect, useState, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import CreateTask from "../../components/CreateTask";
import TaskCard from "../../components/TaskCard";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useService } from "../../context/ServiceContext";
import {
  Plus,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
  Target,
  Zap,
} from "lucide-react";
import DashboardCharts from "../../components/DashboardCharts";

export default function TaskDashboard() {
  const { setActiveService } = useService();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    setActiveService("tasks");
  }, [setActiveService]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/analytics/overview");
      setStatsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAnalytics();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`/tasks/${id}`, { status });
    fetchTasks();
    fetchAnalytics();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task permanently?")) return;
    await axios.delete(`/tasks/${id}`);
    fetchTasks();
    fetchAnalytics();
  };

  const filteredTasks = tasks.filter(
    (t) =>
      (statusFilter === "all" || t.status === statusFilter) &&
      (priorityFilter === "all" || t.priority === priorityFilter)
  );

  const stats = statsData && [
    {
      label: "Overview",
      value: statsData.totalTasks,
      icon: LayoutGrid,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "In Flight",
      value: statsData.pendingTasks + statsData.inProgressTasks,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Achieved",
      value: statsData.completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-28">
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Mission Control
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Dashboard<span className="text-indigo-600">.</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            {user.role === "admin" && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateOpen(true)}
                className="group relative flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-2xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="relative z-10 w-5 h-5 stroke-[3px]" />
                <span className="relative z-10">Initialize Task</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* --- STATS HUD --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats?.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/60 backdrop-blur-md p-1 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50"
            >
              <div className="bg-white rounded-[2.2rem] p-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:rotate-12`}
                >
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- ANALYTICS VISUALIZER --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mb-16"
        >
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Intelligence Feed
            </h3>
          </div>
          {statsData && <DashboardCharts stats={statsData} />}
        </motion.div>

        {/* --- TASK EXPLORER --- */}
        <section>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Active Operations
              </h2>
            </div>

            {/* Advanced Segmented Filter */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white p-2 rounded-[1.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 flex gap-1">
                <LayoutGroup>
                  {["all", "pending", "in_progress", "done"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors z-10 ${
                        statusFilter === s
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {s === "done" ? "Completed" : s.replace("_", " ")}
                      {statusFilter === s && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-200"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </LayoutGroup>
              </div>

              <div className="relative">
                <select
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl pl-6 pr-12 py-4 outline-none hover:bg-black transition-all cursor-pointer shadow-xl shadow-slate-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">Priority: High</option>
                  <option value="medium">Priority: Med</option>
                  <option value="low">Priority: Low</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Task Grid/List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold text-xl tracking-tight">
                    Workspace Clear.
                  </p>
                  <p className="text-slate-300 text-sm mt-1">
                    No tasks matching your current parameters.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      <TaskCard
                        task={task}
                        canUpdate={user.role === "employee"}
                        onStatusUpdate={updateStatus}
                        isAdmin={user.role === "admin"}
                        onEdit={() => {
                          setEditTask(task);
                          setIsCreateOpen(true);
                        }}
                        onDelete={() => handleDelete(task._id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* --- CREATE/EDIT MODAL --- */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              className="relative w-full max-w-3xl bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      Task Config
                    </h2>
                    <p className="text-slate-400 font-medium mt-1">
                      Update operational parameters or create new directives.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <CreateTask
                    editTask={editTask}
                    onClose={() => {
                      setEditTask(null);
                      setIsCreateOpen(false);
                    }}
                    onSuccess={(updatedTask) => {
                      setTasks((prev) =>
                        editTask
                          ? prev.map((t) =>
                              t._id === updatedTask._id ? updatedTask : t
                            )
                          : [updatedTask, ...prev]
                      );
                      fetchAnalytics();
                      setEditTask(null);
                      setIsCreateOpen(false);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
