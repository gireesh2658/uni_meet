import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { getGreeting, formatDate } from "@/utils/helpers";
import { CalendarCheck, Clock, CheckCircle, Users, Hourglass } from "lucide-react";
import AppointmentCard from "@/components/AppointmentCard";
import StatusBadge from "@/components/StatusBadge";
import { mockWeeklyAppointments } from "@/utils/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppointments();

  const myApts = appointments.filter(a => a.facultyId === "f1");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayApts = myApts.filter(a => a.date === todayStr);
  const pending = myApts.filter(a => a.status === "pending");
  const approvedWeek = myApts.filter(a => a.status === "approved").length;
  const totalStudents = new Set(myApts.map(a => a.studentId)).size;

  const stats = [
    { label: "Today's Appointments", value: todayApts.length, icon: <CalendarCheck className="h-5 w-5 text-primary" />, bg: "bg-primary/10" },
    { label: "Pending Requests", value: pending.length, icon: <Hourglass className="h-5 w-5 text-warning" />, bg: "bg-warning/10" },
    { label: "Approved This Week", value: approvedWeek, icon: <CheckCircle className="h-5 w-5 text-success" />, bg: "bg-success/10" },
    { label: "Students Served", value: totalStudents, icon: <Users className="h-5 w-5 text-secondary" />, bg: "bg-secondary/10" },
  ];

  return (
    <div className="page-fade-in space-y-6">
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-secondary/5 p-6">
        <h2 className="text-xl font-bold text-foreground">{getGreeting()}, {user?.name?.split(" ")[0] || "Faculty"}!</h2>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Today's schedule */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Today's Schedule</h3>
        <div className="mt-3 space-y-2">
          {todayApts.length > 0 ? todayApts.map(a => (
            <div key={a.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-medium text-primary min-w-[80px]">{a.startTime}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.studentName}</p>
                <p className="text-xs text-muted-foreground truncate">{a.purpose}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          )) : <p className="text-sm text-muted-foreground">No appointments today</p>}
        </div>
      </div>

      {/* Pending requests */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Pending Requests</h3>
        <div className="mt-3 space-y-3">
          {pending.slice(0, 5).map(a => (
            <AppointmentCard key={a.id} appointment={a} showFaculty={false} showStudent
              actions={
                <>
                  <button onClick={() => { updateAppointmentStatus(a.id, "approved"); toast.success("Approved"); }} className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90">Approve</button>
                  <button onClick={() => { updateAppointmentStatus(a.id, "rejected"); toast.success("Rejected"); }} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">Reject</button>
                </>
              }
            />
          ))}
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests</p>}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Appointments This Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockWeeklyAppointments}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215 16% 47%)" />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FacultyDashboard;
