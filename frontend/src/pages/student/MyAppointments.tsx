import React, { useState } from "react";
import { useAppointments } from "@/context/AppointmentContext";
import StatusBadge from "@/components/StatusBadge";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import { formatDate, truncate } from "@/utils/helpers";
import { Calendar, Eye, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import type { Appointment } from "@/utils/mockData";

const tabs = ["all", "pending", "approved", "rejected", "cancelled", "completed"] as const;

const MyAppointments = () => {
  const { appointments, updateAppointmentStatus } = useAppointments();
  const [tab, setTab] = useState<string>("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);

  const myApts = appointments.filter(a => a.studentId === "s1");
  const filtered = tab === "all" ? myApts : myApts.filter(a => a.status === tab);

  const handleCancel = () => {
    if (cancelId) {
      updateAppointmentStatus(cancelId, "cancelled");
      toast.success("Appointment cancelled");
      setCancelId(null);
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">My Appointments</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No appointments" description={`No ${tab} appointments found`} icon={<Calendar className="h-8 w-8 text-muted-foreground" />} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-xl border border-border bg-card shadow-sm sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Faculty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Purpose</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{a.facultyName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.startTime}</td>
                    <td className="px-4 py-3 text-muted-foreground">{truncate(a.purpose, 30)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setDetail(a)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></button>
                        {(a.status === "pending" || a.status === "approved") && new Date(a.date) >= new Date() && (
                          <button onClick={() => setCancelId(a.id)} className="rounded p-1 text-destructive hover:bg-destructive/10"><XIcon className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map(a => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{a.facultyName}</p>
                    <p className="text-xs text-muted-foreground">{a.department}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(a.date)} • {a.startTime}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.purpose}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setDetail(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">View Details</button>
                  {(a.status === "pending" || a.status === "approved") && new Date(a.date) >= new Date() && (
                    <button onClick={() => setCancelId(a.id)} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!cancelId}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Cancel Appointment"
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDetail(null)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg page-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetail(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><XIcon className="h-4 w-4" /></button>
            <h3 className="text-lg font-semibold text-foreground">Appointment Details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Faculty</span><span className="font-medium text-foreground">{detail.facultyName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="text-foreground">{detail.department}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{formatDate(detail.date)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground">{detail.startTime} – {detail.endTime}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={detail.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Booked On</span><span className="text-foreground">{formatDate(detail.createdAt)}</span></div>
              <div>
                <span className="text-muted-foreground">Purpose</span>
                <p className="mt-1 text-foreground">{detail.purpose}</p>
              </div>
              {detail.rejectionReason && (
                <div>
                  <span className="text-muted-foreground">Rejection Reason</span>
                  <p className="mt-1 text-destructive">{detail.rejectionReason}</p>
                </div>
              )}
            </div>
            {/* Status timeline */}
            <div className="mt-6">
              <p className="text-sm font-medium text-foreground mb-3">Status Timeline</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">Requested</span>
                </div>
                <div className="ml-1.5 h-4 border-l border-border" />
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${detail.status === "rejected" ? "bg-destructive" : detail.status === "pending" ? "bg-muted" : "bg-success"}`} />
                  <span className="text-sm text-foreground">{detail.status === "rejected" ? "Rejected" : detail.status === "pending" ? "Awaiting Approval" : "Approved"}</span>
                </div>
                {detail.status === "completed" && (
                  <>
                    <div className="ml-1.5 h-4 border-l border-border" />
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">Meeting Completed</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
