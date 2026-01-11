import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardCharts({ stats }) {
  /* ---------- SAFE STATS (CRASH PROOF) ---------- */
  const safeStats = {
    pendingTasks: stats?.pendingTasks || 0,
    inProgressTasks: stats?.inProgressTasks || 0,
    completedTasks: stats?.completedTasks || 0,
  };

  const chartData = [
    { name: "Pending", value: safeStats.pendingTasks, color: "#FBBF24" },
    {
      name: "In Progress",
      value: safeStats.inProgressTasks,
      color: "#6366F1",
    },
    {
      name: "Completed",
      value: safeStats.completedTasks,
      color: "#10B981",
    },
  ];

  const hasData = chartData.some((item) => item.value > 0);

  /* ---------- CUSTOM TOOLTIP ---------- */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
            {payload[0]?.payload?.name}
          </p>
          <p className="text-2xl font-black text-slate-900">
            {payload[0]?.value}{" "}
            <span className="text-sm font-medium text-slate-500">Tasks</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* ================= PIE CHART ================= */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 premium-shadow">
        <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Status Distribution
        </h3>

        {!hasData ? (
          <p className="text-center text-slate-400 text-sm mt-20">
            No task data available yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient
                    key={`grad-${index}`}
                    id={`color-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={entry.color}
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor={entry.color}
                      stopOpacity={0.6}
                    />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#color-${index})`}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 premium-shadow">
        <h3 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Productivity Trends
        </h3>

        {!hasData ? (
          <p className="text-center text-slate-400 text-sm mt-20">
            No task data available yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F1F5F9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94A3B8",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#F8FAFC", radius: 12 }}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={45}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
