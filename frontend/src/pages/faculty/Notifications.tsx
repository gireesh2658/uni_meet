import React from "react";
import { useAppointments } from "@/context/AppointmentContext";
import { formatRelativeTime } from "@/utils/helpers";
import { Bell, CalendarCheck, CalendarX, AlertCircle, Clock } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const iconMap: Record<string, React.ReactNode> = {
  confirmed: <CalendarCheck className="h-4 w-4 text-success" />,
  rejected: <CalendarX className="h-4 w-4 text-destructive" />,
  cancelled: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
  reminder: <Clock className="h-4 w-4 text-warning" />,
  new_request: <Bell className="h-4 w-4 text-primary" />,
};

const FacultyNotifications = () => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useAppointments();
  const myNotifs = notifications.filter(n => n.userId === "f1").sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <button onClick={markAllNotificationsRead} className="text-sm font-medium text-primary hover:underline">Mark all as read</button>
      </div>

      {myNotifs.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" icon={<Bell className="h-8 w-8 text-muted-foreground" />} />
      ) : (
        <div className="space-y-2">
          {myNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer transition-colors ${n.isRead ? "bg-card" : "bg-primary/5 border-primary/20"}`}
            >
              <div className="mt-0.5">{iconMap[n.type] || <Bell className="h-4 w-4" />}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? "text-foreground" : "font-semibold text-foreground"}`}>{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.timestamp)}</p>
              </div>
              {!n.isRead && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyNotifications;
