import {
  CheckSquare,
  FileText,
  Brain,
  Users,
  Mail,
} from "lucide-react";

export const SERVICES = [
  {
    id: "tasks",
    name: "Task Manager",
    description: "Plan, assign, track and analyze tasks intelligently.",
    icon: CheckSquare,
    route: "/tasks",
    status: "active",
  },
  {
    id: "invoices",
    name: "Smart Invoice",
    description: "AI-powered invoice & payment tracking.",
    icon: FileText,
    route: "/invoices",
    status: "active",
  },
  {
  id: "smart_email",
  name: "Smart Email",
  description: "Schedule AI-generated emails to be sent at the perfect time.",
  icon: Mail,
  route: "/automation/smart-email",
  status: "active",
},
  {
    id: "members",
    name: "Members",
    description: "Manage workspace users",
    icon: Users,
    route: "/members",
    status: "active",
    adminOnly: true,
  },
];
