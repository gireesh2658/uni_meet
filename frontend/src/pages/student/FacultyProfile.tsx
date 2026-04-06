import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockFaculty, mockSlots } from "@/utils/mockData";
import { useAppointments } from "@/context/AppointmentContext";
import { getInitials, getAvatarColor, formatDate } from "@/utils/helpers";
import { Mail, MapPin, Phone, BookOpen } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

const FacultyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAppointment } = useAppointments();
  const faculty = mockFaculty.find(f => f.id === id);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  if (!faculty) return <EmptyState title="Faculty not found" description="The faculty member you're looking for doesn't exist." />;

  const dates = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(), i), "yyyy-MM-dd"));
  const daySlots = mockSlots.filter(s => s.facultyId === faculty.id && s.date === selectedDate);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !purpose.trim()) {
      toast.error("Please select a slot and enter the purpose");
      return;
    }
    const slot = daySlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    setLoading(true);
    setTimeout(() => {
      addAppointment({
        id: `apt-${Date.now()}`,
        studentId: "s1",
        studentName: "Priya Deshmukh",
        facultyId: faculty.id,
        facultyName: faculty.name,
        department: faculty.department,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        purpose,
        status: "pending",
        createdAt: format(new Date(), "yyyy-MM-dd"),
      });
      toast.success("Appointment request submitted!");
      navigate("/student/appointments");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="page-fade-in">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-card ${getAvatarColor(faculty.name)}`}>
              {getInitials(faculty.name)}
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">{faculty.name}</h2>
            <p className="text-sm text-muted-foreground">{faculty.designation}</p>
            <p className="text-sm text-primary">{faculty.department}</p>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{faculty.email}</div>
            {faculty.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{faculty.phone}</div>}
            {faculty.officeRoom && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{faculty.officeRoom}</div>}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><BookOpen className="h-4 w-4" />About</div>
            <p className="mt-1 text-sm text-muted-foreground">{faculty.bio}</p>
          </div>
        </div>

        {/* Slots & Booking */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground">Available Time Slots</h3>

            {/* Date picker */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {dates.map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                  className={`flex min-w-[80px] flex-col items-center rounded-lg border px-3 py-2 text-xs transition-colors ${
                    d === selectedDate ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{format(new Date(d), "EEE")}</span>
                  <span className="text-lg font-bold">{format(new Date(d), "dd")}</span>
                  <span>{format(new Date(d), "MMM")}</span>
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="mt-4 flex flex-wrap gap-2">
              {daySlots.length > 0 ? daySlots.map(s => (
                <button
                  key={s.id}
                  disabled={s.isBooked}
                  onClick={() => setSelectedSlot(s.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    s.isBooked
                      ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : s.id === selectedSlot
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-success/30 bg-success/10 text-success hover:bg-success/20"
                  }`}
                >
                  {s.startTime}
                </button>
              )) : (
                <p className="text-sm text-muted-foreground">No slots available for this date</p>
              )}
            </div>
          </div>

          {/* Booking form */}
          {selectedSlot && (
            <form onSubmit={handleBook} className="rounded-xl border border-border bg-card p-6 shadow-sm page-fade-in">
              <h3 className="text-lg font-semibold text-foreground">Book Appointment</h3>
              <p className="text-sm text-muted-foreground">
                Selected: {formatDate(selectedDate)} at {daySlots.find(s => s.id === selectedSlot)?.startTime}
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground">Purpose of Meeting</label>
                <textarea
                  value={purpose} onChange={e => setPurpose(e.target.value)}
                  maxLength={300} rows={3}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Briefly describe the purpose of your meeting…"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">{purpose.length}/300</p>
              </div>
              <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {loading ? "Submitting…" : "Request Appointment"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
