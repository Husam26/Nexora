import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  BrainCircuit,
  User,
  Play,
} from "lucide-react";

/* ---------- Helpers ---------- */
const formatDueDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TaskCard({
  task,
  canUpdate,
  onStatusUpdate,
  isAdmin,
  onEdit,
  onDelete,
}) {
  /* ---------- Status Config ---------- */
  const statusConfig = {
    pending: {
      color: "text-amber-600 bg-amber-50 border-amber-100",
      dot: "bg-amber-500",
      icon: Clock,
    },
    in_progress: {
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      dot: "bg-indigo-500",
      icon: Play,
    },
    done: {
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
  };

  const currentStatus = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  /* ---------- Priority ---------- */
  const priorityConfig = {
    high: "bg-rose-50 text-rose-600 border-rose-100",
    medium: "bg-blue-50 text-blue-600 border-blue-100",
    low: "bg-slate-50 text-slate-500 border-slate-100",
  }[task.priority];

  /* ---------- Due Date Logic ---------- */
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  /* ---------- Assigned To Safe Handling ---------- */
  const assignedInitial =
    typeof task.assignedTo === "string"
      ? task.assignedTo.charAt(0).toUpperCase()
      : task.assignedTo?.name?.charAt(0).toUpperCase() || null;

  const assignedLabel =
    typeof task.assignedTo === "string"
      ? "Personal Task"
      : task.assignedTo?.name || "Open Assignment";

  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      className="group relative bg-white border border-slate-200/60 rounded-[2rem] p-7 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-indigo-200/50"
    >
      {/* Priority Accent Bar */}
      <div
        className={`absolute left-0 top-12 bottom-12 w-1.5 rounded-r-full ${
          task.priority === "high"
            ? "bg-rose-500"
            : task.priority === "medium"
            ? "bg-indigo-500"
            : "bg-slate-200"
        }`}
      />

      {/* ---------- Header ---------- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${currentStatus.color}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot} animate-pulse`}
            />
            {task.status.replace("_", " ")}
          </span>

          {/* Priority */}
          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${priorityConfig}`}
          >
            {task.priority} Priority
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                isOverdue
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-slate-50 text-slate-600 border-slate-100"
              }`}
            >
              <Clock className="w-3 h-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-1">
            {task.status !== "done" && (
              <button
                onClick={onEdit}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onDelete}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ---------- Content ---------- */}
      <div className="mb-6 pl-2">
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">
          {task.title}
        </h4>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
          {task.description ||
            "Refine implementation details and workflow integration."}
        </p>
      </div>

      {/* ---------- AI Section ---------- */}
      <AnimatePresence>
        {task.aiInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                AI Performance Forecast
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Estimated Time
                </span>
                <p className="text-sm font-bold text-slate-800">
                  {task.aiInsights.estimatedTime}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Focus
                </span>
                <p className="text-[11px] font-semibold text-slate-600 italic">
                  "{task.aiInsights.note}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Footer ---------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 pl-2">
        {/* Assigned To */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-200 border-2 border-white flex items-center justify-center font-black text-slate-600">
            {assignedInitial || <User className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase">
              Ownership
            </span>
            <p className="text-sm font-bold text-slate-800">{assignedLabel}</p>
          </div>
        </div>

        {/* Actions */}
        {canUpdate && task.status !== "done" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              onStatusUpdate(
                task._id,
                task.status === "pending" ? "in_progress" : "done"
              )
            }
            className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-xs font-black hover:bg-indigo-600 transition-all"
          >
            {task.status === "pending" ? "INITIATE TASK" : "FINALIZE TASK"}
          </motion.button>
        )}

        {task.status === "done" && (
          <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-emerald-100">
            Archived & Complete
          </div>
        )}
      </div>
    </motion.div>
  );
}
