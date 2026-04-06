import React from "react";
import { useAppointments } from "@/context/AppointmentContext";
import { mockFaculty, mockStudents, mockMonthlyTrend, mockDepartmentStats, mockTopFaculty } from "@/utils/mockData";
import { Users, GraduationCap, CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/utils/helpers";

const COLORS = ["hsl(239 84% 67%)", "hsl(263 70% 58%)", "hsl(160 84% 39%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];

const AdminDashboard = () => {
  const { appointments } = useAppointments();
  const todayStr = new Date().toISOString().split("T")[0];

  const stats = [
    { label: "Total Students", value: mockStudents.length, icon: <GraduationCap className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
    { label: "Total Faculty", value: mockFaculty.length, icon: <Users className="h-5 w-5 text-secondary" />, bg: "bg-secondary/10" },
    { label: "Total Appointments", value: appointments.length, icon: <CalendarCheck className="h-5 w-5 text-success" />, bg: "bg-success/10" },
    { label: "Pending Today", value: appointments.filter(a => a.date === todayStr && a.status === "pending").length, icon: <Clock className="h-5 w-5 text-warning" />, bg: "bg-warning/10" },
    { label: "Completed This Month", value: appointments.filter(a => a.status === "completed").length, icon: <CheckCircle className="h-5 w-5 text-success" />, bg: "bg-success/10" },
    { label: "Rejected This Month", value: appointments.filter(a => a.status === "rejected").length, icon: <XCircle className="h-5 w-5 text-destructive" />, bg: "bg-destructive/10" },
  ];

  return (
    <div className="page-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${s.bg}`}>{s.icon}</div>
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Appointment Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockMonthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215 16% 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="hsl(239 84% 67%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Appointments by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockDepartmentStats} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="department" label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {mockDepartmentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Faculty by Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockTopFaculty} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} stroke="hsl(215 16% 47%)" />
              <Tooltip />
              <Bar dataKey="bookings" fill="hsl(263 70% 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {appointments.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm hover:bg-muted/30">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{a.studentName} → {a.facultyName}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.date)} • {a.startTime}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
