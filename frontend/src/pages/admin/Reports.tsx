import React, { useState } from "react";
import { mockDepartmentStats, mockMonthlyTrend } from "@/utils/mockData";
import { useAppointments } from "@/context/AppointmentContext";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(239 84% 67%)", "hsl(263 70% 58%)", "hsl(160 84% 39%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];

const Reports = () => {
  const { appointments } = useAppointments();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const total = appointments.length;
  const approved = appointments.filter(a => a.status === "approved" || a.status === "completed").length;
  const rejected = appointments.filter(a => a.status === "rejected").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  const statusData = [
    { name: "Approved", value: approved },
    { name: "Pending", value: appointments.filter(a => a.status === "pending").length },
    { name: "Rejected", value: rejected },
    { name: "Cancelled", value: cancelled },
    { name: "Completed", value: appointments.filter(a => a.status === "completed").length },
  ];

  const inputCls = "rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Reports & Analytics</h2>
        <button onClick={() => { window.print(); toast.success("Print dialog opened"); }} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-3">
        <div><label className="block text-xs text-muted-foreground mb-1">From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-xs text-muted-foreground mb-1">To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls} /></div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total Bookings</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-success">{total > 0 ? ((approved / total) * 100).toFixed(0) : 0}%</p>
          <p className="text-xs text-muted-foreground">Approval Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-destructive">{total > 0 ? ((rejected / total) * 100).toFixed(0) : 0}%</p>
          <p className="text-xs text-muted-foreground">Rejection Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-warning">{total > 0 ? ((cancelled / total) * 100).toFixed(0) : 0}%</p>
          <p className="text-xs text-muted-foreground">Cancellation Rate</p>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Department-wise Breakdown</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border"><th className="px-4 py-2 text-left text-muted-foreground">Department</th><th className="px-4 py-2 text-left text-muted-foreground">Appointments</th></tr></thead>
          <tbody>{mockDepartmentStats.map(d => (
            <tr key={d.department} className="border-b border-border last:border-0"><td className="px-4 py-2 text-foreground">{d.department}</td><td className="px-4 py-2 text-foreground">{d.count}</td></tr>
          ))}</tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockMonthlyTrend.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215 16% 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
              <Tooltip /><Line type="monotone" dataKey="appointments" stroke="hsl(239 84% 67%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Appointments by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockDepartmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(215 16% 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
              <Tooltip /><Bar dataKey="count" fill="hsl(263 70% 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
