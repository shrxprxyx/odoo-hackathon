"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  available: number;
  allocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  overdue: number;
  upcomingReturns: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="p-8">Loading...</p>;

  const cards = [
    { label: "Available", value: data.available },
    { label: "Allocated", value: data.allocated },
    { label: "Maintenance Today", value: data.maintenanceToday },
    { label: "Active Bookings", value: data.activeBookings },
    { label: "Pending Transfers", value: data.pendingTransfers },
    { label: "Upcoming Returns", value: data.upcomingReturns },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold">Today's Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {data.overdue > 0 && (
        <div className="border border-red-400 bg-red-50 rounded-lg p-4 text-red-700">
          {data.overdue} asset{data.overdue > 1 ? "s" : ""} overdue — flagged for follow-up
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/assets" className="px-4 py-2 bg-black text-white rounded">
          + Register Asset
        </Link>
        <Link href="/bookings" className="px-4 py-2 bg-black text-white rounded">
          Book Resource
        </Link>
        <Link href="/maintenance" className="px-4 py-2 bg-black text-white rounded">
          Raise Request
        </Link>
      </div>
    </div>
  );
}