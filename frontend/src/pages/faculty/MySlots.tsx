import React, { useState } from "react";
import { mockSlots } from "@/utils/mockData";
import { format, addDays, startOfWeek } from "date-fns";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TimeSlot } from "@/utils/mockData";

const timeOptions = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
  "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"
];

const MySlots = () => {
  const [slots, setSlots] = useState<TimeSlot[]>(mockSlots.filter(s => s.facultyId === "f1"));
  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: format(new Date(), "yyyy-MM-dd"), time: "09:00 AM", duration: 30 });

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAdd = () => {
    const slot: TimeSlot = {
      id: `slot-new-${Date.now()}`,
      facultyId: "f1",
      date: newSlot.date,
      startTime: newSlot.time,
      endTime: newSlot.time,
      duration: newSlot.duration,
      isBooked: false,
    };
    setSlots(prev => [...prev, slot]);
    setShowModal(false);
    toast.success("Slot added successfully");
  };

  const handleDelete = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
    toast.success("Slot deleted");
  };

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">My Slots</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Slot
        </button>
      </div>

      {/* Week view */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {weekDays.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const daySlots = slots.filter(s => s.date === dateStr);
          const isPast = day < new Date() && format(day, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd");

          return (
            <div key={dateStr} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{format(day, "EEE")}</p>
              <p className="text-lg font-bold text-foreground">{format(day, "dd")}</p>
              <div className="mt-2 space-y-1">
                {daySlots.length > 0 ? daySlots.map(s => (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium ${
                      isPast ? "bg-muted text-muted-foreground" :
                      s.isBooked ? "bg-primary/10 text-primary" :
                      "bg-success/10 text-success"
                    }`}
                  >
                    <span>{s.startTime}</span>
                    {!s.isBooked && !isPast && (
                      <button onClick={() => handleDelete(s.id)} className="hidden group-hover:block">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">No slots</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-success/30" /> Available</span>
        <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-primary/30" /> Booked</span>
        <span className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-muted" /> Past</span>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg page-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            <h3 className="text-lg font-semibold text-foreground">Add New Slot</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">Date</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Time</label>
                <select value={newSlot.time} onChange={e => setNewSlot(p => ({ ...p, time: e.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Duration</label>
                <select value={newSlot.duration} onChange={e => setNewSlot(p => ({ ...p, duration: parseInt(e.target.value) }))} className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              <button onClick={handleAdd} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Save Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySlots;
