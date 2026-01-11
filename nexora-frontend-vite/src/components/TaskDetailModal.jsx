import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "../api/axios";

const TaskDetailModal = ({
  isOpen,
  onClose,
  selectedTask,
  user,
  onRefresh,
  onEditTrigger,
  onOpenCloseModal,
}) => {
  const [emailData, setEmailData] = useState({ subject: "", body: "" });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen || !selectedTask) return null;

  const { task, context } = selectedTask;

  /* ---------------- STATUS UPDATE ---------------- */
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`/tasks/${task._id}`, { status: newStatus });
      await onRefresh(); // refresh dashboard + stats
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status");
    }
  };

  /* ---------------- EMAIL ---------------- */
  const handleSendReminder = async () => {
    if (!emailData.subject || !emailData.body) return;
    try {
      await axios.post(`/tasks/${task._id}/send-invoice-reminder`, emailData);
      setIsEmailModalOpen(false);
      alert("Reminder email sent!");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert("Daily reminder limit reached (2 per day)");
      } else {
        alert("Failed to send email");
      }
    }
  };

  const openEmailModal = () => {
    setEmailData({
      subject: `Reminder: Invoice ${context.invoiceNumber} Due`,
      body: `Dear ${context.customer.name},

This is a reminder that your invoice ${
        context.invoiceNumber
      } is due on ${new Date(context.dueDate).toLocaleDateString()}.

Please arrange payment at your earliest convenience.

Best regards,
${user.name}`,
    });
    setIsEmailModalOpen(true);
  };

  const isAssignedUser = task.assignedTo?._id === user?._id;
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
        <motion.div
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-white rounded-[3.5rem] overflow-y-auto max-h-[90vh]"
        >
          <div className="p-10">
            {/* Header */}
            <div className="flex justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">
                  Task Details
                </h2>
                <p className="text-slate-400">Task information & actions</p>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-rose-500 hover:text-white p-3 rounded-xl transition"
              >
                <X />
              </button>
            </div>

            {/* Context (Invoice) */}
            {context && (
              <div className="mb-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p>
                  <b>Invoice:</b> {context.invoiceNumber}
                </p>
                <p>
                  <b>Status:</b> {context.status}
                </p>
                <p>
                  <b>Customer:</b> {context.customer.name}
                </p>
              </div>
            )}

            {/* Task Info */}
            <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
            <p className="text-slate-600 mb-6">{task.description}</p>

            <div className="flex gap-3 mb-6">
              <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold uppercase">
                Priority: {task.priority}
              </span>
              <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold uppercase">
                Status: {task.status}
              </span>
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
              {/* Invoice actions */}
              {task.source === "invoice" && (
                <>
                  <button
                    onClick={() =>
                      (window.location.href = `/invoices/${context.invoiceNumber}`)
                    }
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
                  >
                    📄 View Invoice
                  </button>

                  <button
                    onClick={openEmailModal}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold"
                  >
                    📧 Send Reminder
                  </button>
                </>
              )}

              {/* STATUS FLOW — ONLY ASSIGNED EMPLOYEE */}
              {isAssignedUser && (
                <>
                  {task.status === "pending" && (
                    <button
                      onClick={() => updateStatus("in_progress")}
                      className="bg-yellow-500 text-white px-6 py-3 rounded-2xl font-bold"
                    >
                      ▶ Move to In Progress
                    </button>
                  )}

                  {task.status === "in_progress" && (
                    <button
                      onClick={() => onOpenCloseModal(task)}
                      className="bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold"
                    >
                      ✅ Mark as Completed
                    </button>
                  )}
                </>
              )}

              {/* EDIT — ONLY ADMIN & NON-INVOICE */}
              {isAdmin &&
                task.source !== "invoice" &&
                task.status !== "done" && (
                  <button
                    onClick={() => onEditTrigger(task)}
                    className="bg-slate-100 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200"
                  >
                    ✏️ Edit Task
                  </button>
                )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= EMAIL MODAL ================= */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center">
            <motion.div
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-3xl max-w-lg w-full"
            >
              <h3 className="text-xl font-black mb-4">Send Reminder</h3>

              <input
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
                className="w-full mb-3 p-3 bg-slate-100 rounded-xl"
              />

              <textarea
                rows={5}
                value={emailData.body}
                onChange={(e) =>
                  setEmailData({ ...emailData, body: e.target.value })
                }
                className="w-full p-3 bg-slate-100 rounded-xl resize-none"
              />

              <button
                onClick={handleSendReminder}
                className="mt-4 bg-emerald-600 text-white px-6 py-3 rounded-2xl w-full font-bold"
              >
                Send Reminder
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskDetailModal;
