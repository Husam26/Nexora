import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  BrainCircuit,
  User,
  Play,
} from "lucide-react";

/* ================= HELPERS ================= */
const formatDueDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ================= CONFIG ================= */
const STATUS_CONFIG = {
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

const PRIORITY_CONFIG = {
  high: "bg-rose-50 text-rose-600 border-rose-100",
  medium: "bg-blue-50 text-blue-600 border-blue-100",
  low: "bg-slate-50 text-slate-500 border-slate-100",
};

/* ================= COMPONENT ================= */
export default function TaskCard({
  task,
  canUpdate,
  onStatusUpdate,
  isAdmin,
  onEdit,
  onDelete,
  onDetail,
  onCloseTask,
}) {
  const statusUI = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusUI.icon;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

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
      onClick={onDetail}
      className="relative bg-white border border-slate-200/60 rounded-[2rem] p-7 cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all"
    >
      {/* Priority Bar */}
      <div
        className={`absolute left-0 top-12 bottom-12 w-1.5 rounded-r-full ${
          task.priority === "high"
            ? "bg-rose-500"
            : task.priority === "medium"
            ? "bg-indigo-500"
            : "bg-slate-200"
        }`}
      />

      {/* ================= HEADER ================= */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${statusUI.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusUI.dot}`} />
            {task.status.replace("_", " ")}
          </span>

          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
              PRIORITY_CONFIG[task.priority]
            }`}
          >
            {task.priority} priority
          </span>

          {task.dueDate && (
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
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

        {/* ===== ADMIN ACTIONS (DELETE ALWAYS ENABLED) ===== */}
        {isAdmin && (
          <div className="flex gap-1">
            {task.status !== "done" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* ✅ DELETE ALWAYS AVAILABLE */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <h4 className="text-2xl font-bold text-slate-900 mb-3">{task.title}</h4>
      <p className="text-slate-500 text-sm mb-6">
        {task.description || "No description provided."}
      </p>

      {/* ================= AI INSIGHTS ================= */}
      <AnimatePresence>
        {task.aiInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black uppercase text-slate-400">
                AI Forecast
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {task.aiInsights.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CLOSED INFO ================= */}
      {task.status === "done" && (task.closedAt || task.closedReason) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-100"
        >
          <p className="text-xs font-black uppercase text-emerald-600 mb-2">
            Task Closed
          </p>

          {task.closedAt && (
            <p className="text-sm text-slate-700 font-semibold">
              <span className="text-slate-500 font-medium">Closed on:</span>{" "}
              {formatDueDate(task.closedAt)}
            </p>
          )}

          {task.closedReason && (
            <p className="text-sm text-slate-700 font-semibold mt-1">
              <span className="text-slate-500 font-medium">Reason:</span>{" "}
              {task.closedReason}
            </p>
          )}
        </motion.div>
      )}

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold">
            {assignedInitial || <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Owner</p>
            <p className="text-sm font-bold">{assignedLabel}</p>
          </div>
        </div>

        {canUpdate && task.status !== "done" && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // 🚫 prevent card click
              task.status === "pending"
                ? onStatusUpdate(task._id, "in_progress")
                : onCloseTask(task);
            }}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-indigo-600"
          >
            {task.status === "pending" ? "START TASK" : "COMPLETE TASK"}
          </button>
        )}

        {task.status === "done" && (
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            COMPLETED
          </span>
        )}
      </div>
    </motion.div>
  );
}
