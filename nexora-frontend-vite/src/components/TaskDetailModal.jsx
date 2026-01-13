import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar, 
  Mail, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  Edit3, 
  User as UserIcon,
  CreditCard,
  AlertCircle,
  Clock,
  Send
} from "lucide-react";
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

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`/tasks/${task._id}`, { status: newStatus });
      await onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async () => {
    if (!emailData.subject || !emailData.body) return;
    try {
      await axios.post(`/tasks/${task._id}/send-invoice-reminder`, emailData);
      setIsEmailModalOpen(false);
    } catch (err) {
      alert("Failed to send reminder.");
    }
  };

  const openEmailModal = () => {
    setEmailData({
      subject: `Action Required: Invoice ${context.invoiceNumber} Pending`,
      body: `Dear ${context.customer.name},\n\nThis is a courtesy reminder regarding Invoice ${context.invoiceNumber}, due on ${new Date(context.dueDate).toLocaleDateString()}.\n\nPlease let us know if you have any questions.\n\nBest regards,\n${user.name}`,
    });
    setIsEmailModalOpen(true);
  };

  const isAssignedUser = task.assignedTo?._id === user?._id;
  const isAdmin = user?.role === "admin";

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
        {/* Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 50, scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          {/* Header Tray */}
          <div className="flex justify-between items-center p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Task Insight</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {task._id.slice(-6)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 pt-2 overflow-y-auto max-h-[75vh]">
            {/* Linked Object Card (Invoice Context) */}
            {context && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] text-white shadow-xl shadow-indigo-200/40 relative overflow-hidden group"
              >
                <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Linked Invoice</span>
                    <h4 className="text-xl font-black">#{context.invoiceNumber}</h4>
                    <p className="text-sm font-medium text-indigo-100 opacity-80">{context.customer.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-indigo-200">Current Status</p>
                       <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md italic capitalize">
                         {context.status}
                       </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-black text-slate-900 mb-4">{task.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {task.description || "No detailed description provided for this intelligence task."}
                </p>
              </div>

              {/* Meta Sidebar */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Specifications</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="capitalize">{task.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span className="capitalize">{task.priority} Priority</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 border-t border-slate-200 pt-3">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{task.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Tray */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center gap-4">
              {task.source === "invoice" && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => (window.location.href = `/invoices/${context.invoiceNumber}`)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-7 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openEmailModal}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-7 py-4 rounded-2xl font-bold text-sm border border-indigo-100"
                  >
                    <Mail className="w-4 h-4" />
                    Send Reminder
                  </motion.button>
                </>
              )}

              <div className="flex-1" />

              {isAssignedUser && (
                <div className="flex gap-3">
                  {task.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => updateStatus("in_progress")}
                      className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Task
                    </motion.button>
                  )}

                  {task.status === "in_progress" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onOpenCloseModal(task)}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Task
                    </motion.button>
                  )}
                </div>
              )}

              {isAdmin && task.source !== "invoice" && task.status !== "done" && (
                <button
                  onClick={() => onEditTrigger(task)}
                  className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= EMAIL MODAL (REFURBISHED) ================= */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-white p-10 rounded-[3rem] max-w-lg w-full shadow-2xl border border-slate-100"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Draft Reminder</h3>
                <p className="text-sm text-slate-400 font-bold">The recipient will receive this as an official Nexora notice.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Subject</label>
                  <input
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Message Content</label>
                  <textarea
                    rows={6}
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-600 resize-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendReminder}
                className="mt-8 bg-indigo-600 text-white px-6 py-4 rounded-2xl w-full font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100"
              >
                <Send className="w-5 h-5" />
                Dispatch Reminder
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TaskDetailModal;