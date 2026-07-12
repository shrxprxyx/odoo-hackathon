"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Settings,
  Package,
  ArrowRightLeft,
  Calendar,
  Wrench,
  CheckSquare,
  FileText,
  Clock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <BarChart3 size={20} /> },
  {
    label: "Organization Setup",
    href: "/org-setup",
    icon: <Settings size={20} />,
    adminOnly: true,
  },
  { label: "Asset Registry", href: "/assets", icon: <Package size={20} /> },
  {
    label: "Allocation & Transfer",
    href: "/allocations",
    icon: <ArrowRightLeft size={20} />,
  },
  {
    label: "Resource Booking",
    href: "/bookings",
    icon: <Calendar size={20} />,
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: <Wrench size={20} />,
  },
  { label: "Audit Cycles", href: "/audits", icon: <CheckSquare size={20} /> },
  { label: "Reports", href: "/reports", icon: <FileText size={20} /> },
  {
    label: "Activity & Notifications",
    href: "/activity",
    icon: <Clock size={20} />,
  },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

export function Sidebar({ userRole = "EMPLOYEE", userName = "User", onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isAdmin = userRole === "ADMIN";
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleLogout = () => {
    if (onLogout) onLogout();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-700 flex flex-col transition-transform duration-300 md:translate-x-0 z-40",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">AssetFlow</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Asset Manager</p>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => setOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors text-sm font-medium",
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 space-y-3">
          <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-blue-400">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-900 hover:text-red-100 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content offset (desktop only) */}
      <div className="hidden md:block w-64" />
    </>
  );
}