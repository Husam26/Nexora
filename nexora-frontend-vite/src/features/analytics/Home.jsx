import { useContext, useEffect } from "react";
import { useService } from "../../context/ServiceContext";
import ServiceCard from "../../components/ui/ServiceCard";
import { SERVICES } from "../../config/services";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";

export default function Home() {
  const { setActiveService } = useService();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setActiveService("home");
  }, [setActiveService]);

  const visibleServices = SERVICES.filter((service) => {
    if (service.adminOnly && user?.role !== "admin") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[120px] -z-10" />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20">
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
              Central{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Command.
              </span>
            </h1>
            <p className="text-slate-500 mt-4 text-lg font-medium max-w-xl leading-relaxed">
              Welcome back. One workspace to manage everything you build and
              scale.
            </p>
          </motion.div>
        </header>

        {/* Services Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {visibleServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </motion.div>
      </main>
    </div>
  );
}
