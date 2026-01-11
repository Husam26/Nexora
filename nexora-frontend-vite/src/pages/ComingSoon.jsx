import { motion } from "framer-motion";

export default function ComingSoon({ title }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-slate-900 mb-3"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-slate-500 max-w-md"
      >
        This service is under development and will be available soon.
      </motion.p>
    </div>
  );
}
