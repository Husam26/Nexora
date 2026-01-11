import { Outlet } from "react-router-dom";

export default function TaskLayout() {
  return (
    <div className="flex">
      {/* Later: Task Sidebar */}
      <div className="flex-1 bg-slate-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
