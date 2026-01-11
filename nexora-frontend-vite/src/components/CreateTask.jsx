import { useEffect, useState } from "react";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Type,
  AlignLeft,
  Loader2,
  Clock,
} from "lucide-react";

export default function CreateTask({ editTask, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  const isEdit = Boolean(editTask?._id);

  /* ---------- Preload form on EDIT ---------- */
  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title,
        description: editTask.description || "",
        assignedTo:
          typeof editTask.assignedTo === "string"
            ? editTask.assignedTo
            : editTask.assignedTo?._id || "",
        priority: editTask.priority,
        dueDate: editTask.dueDate?.slice(0, 10) || "",
      });
      setAiSuggestion(editTask.aiInsights || null);
    }
  }, [editTask]);

  /* ---------- Fetch Users ---------- */
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("/users");
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  /* ---------- AI Suggestion ---------- */
  const getAISuggestion = async () => {
    if (!form.title) return;
    setLoadingAI(true);
    try {
      const res = await axios.post("/ai/analyze-task", {
        title: form.title,
        description: form.description,
        taskId: editTask?._id || null,
      });
      setAiSuggestion(res.data);
      setForm((prev) => ({
        ...prev,
        priority: res.data.suggestedPriority,
        dueDate: res.data.dueDate
          ? res.data.dueDate.slice(0, 10)
          : prev.dueDate,
      }));
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setLoadingAI(false);
    }
  };

  /* ---------- Submit ---------- */
  const submitTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      aiInsights: aiSuggestion || null,
    };

    try {
      const res = isEdit
        ? await axios.put(`/tasks/${editTask._id}`, payload)
        : await axios.post("/tasks", payload);

      onSuccess(res.data);
    } catch (err) {
      console.error("Task save error:", err.response?.data || err.message);
      alert("Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-1">
      <form onSubmit={submitTask} className="space-y-5">
        {/* Title */}
        <div className="relative">
          <Type className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            className="w-full pl-10 py-3 rounded-xl bg-slate-50"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div className="relative">
          <AlignLeft className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <textarea
            className="w-full pl-10 py-3 rounded-xl bg-slate-50"
            placeholder="Add details..."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* AI Button */}
        <button
          type="button"
          onClick={getAISuggestion}
          disabled={loadingAI}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loadingAI ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Optimize with AI
        </button>

        {/* AI Result */}
        <AnimatePresence>
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-indigo-50 p-4 rounded-xl"
            >
              <p><b>Priority:</b> {aiSuggestion.suggestedPriority}</p>
              <p><b>Estimated:</b> {aiSuggestion.estimatedTime}</p>
              <p className="italic text-sm">"{aiSuggestion.note}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assign + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            required
          >
            <option value="">Assign to</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="relative">
          <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="date"
            className="w-full pl-10 py-3 rounded-xl bg-slate-50"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="bg-black text-white py-3 rounded-xl w-full"
        >
          {loading ? (
            <Loader2 className="mx-auto animate-spin" />
          ) : isEdit ? (
            "Update Task"
          ) : (
            "Create Task"
          )}
        </button>
      </form>
    </div>
  );
}
