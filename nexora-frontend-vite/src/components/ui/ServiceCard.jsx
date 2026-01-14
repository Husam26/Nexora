import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";

export default function ServiceCard({
  name,
  description,
  icon: Icon,
  route,
  status,
}) {
  const navigate = useNavigate();
  const active = status === "active";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
      }}
      whileHover={active ? { y: -8, scale: 1.02 } : {}}
      whileTap={active ? { scale: 0.98 } : {}}
      onClick={() => active && navigate(route)}
      className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden
        ${active
          ? "bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:border-indigo-200 cursor-pointer"
          : "bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed"
        }`}
    >
      {/* Glossy Background Effect on Hover */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
            ${active 
              ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white group-hover:rotate-[10deg] group-hover:scale-110 shadow-indigo-200" 
              : "bg-slate-200 text-slate-400"
            }`}
          >
            <Icon className="w-7 h-7" />
          </div>

          {active ? (
            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          ) : (
            <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Locked</span>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
          {name}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed font-medium">
          {description}
        </p>

        {active && (
          <div className="mt-6 flex items-center gap-2">
            <div className="h-1 w-8 bg-indigo-600 rounded-full" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Application
            </span>
          </div>
        )}
      </div>

      {/* Decorative "Glass" highlight corner */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/40 blur-2xl rounded-full" />
    </motion.div>
  );
}