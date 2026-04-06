import React, { useState } from "react";
import { useAppointments } from "@/context/AppointmentContext";
import StatusBadge from "@/components/StatusBadge";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import { formatDate, truncate } from "@/utils/helpers";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

const tabs = ["pending", "approved", "rejected", "all"] as const;

const FacultyRequests = () => {
  const { appointments, updateAppointmentStatus } = useAppointments();
  const [tab, setTab] = useState<string>("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const myApts = appointments.filter(a => a.facultyId === "f1");
  const filtered = tab === "all" ? myApts : myApts.filter(a => a.status === tab);

  const handleApprove = (id: string) => {
    updateAppointmentStatus(id, "approved");
    toast.success("Appointment approved");
  };

  const handleReject = () => {
    if (rejectId) {
      updateAppointmentStatus(rejectId, "rejected", rejectReason);
      toast.success("Appointment rejected");
      setRejectId(null);
      setRejectReason("");
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">Appointment Requests</h2>

      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t} {t === "pending" && `(${myApts.filter(a => a.status === "pending").length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No requests" description={`No ${tab} requests found`} icon={<Calendar className="h-8 w-8 text-muted-foreground" />} />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Department</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Time</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Purpose</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{a.studentName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.department}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.startTime}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{truncate(a.purpose, 30)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    {a.status === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApprove(a.id)} className="rounded-lg bg-success px-3 py-1 text-xs font-medium text-success-foreground hover:bg-success/90">Approve</button>
                        <button onClick={() => setRejectId(a.id)} className="rounded-lg bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!rejectId}
        title="Reject Appointment"
        message="Are you sure you want to reject this appointment?"
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => { setRejectId(null); setRejectReason(""); }}
      >
        <textarea
          value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          rows={3}
        />
      </ConfirmModal>
    </div>
  );
};

export default FacultyRequests;
