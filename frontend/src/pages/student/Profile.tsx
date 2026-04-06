import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    studentId: user?.studentId || "STU2024001",
    department: user?.department || "Computer Science",
    phone: user?.phone || "",
  });
  const [pw, setPw] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateUser(form);
      toast.success("Profile updated successfully");
      setLoading(false);
    }, 500);
  };

  const handlePwChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new !== pw.confirm) { toast.error("Passwords do not match"); return; }
    if (pw.new.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    toast.success("Password changed successfully");
    setPw({ old: "", new: "", confirm: "" });
  };

  const inputCls = "mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="page-fade-in space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground">My Profile</h2>

      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Full Name</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Student ID</label>
            <input value={form.studentId} readOnly className={`${inputCls} bg-muted`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Department</label>
            <input value={form.department} readOnly className={`${inputCls} bg-muted`} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Phone Number</label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+91 98765 43210" />
        </div>
        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <form onSubmit={handlePwChange} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
        <div>
          <label className="block text-sm font-medium text-foreground">Current Password</label>
          <input type="password" value={pw.old} onChange={e => setPw(p => ({ ...p, old: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">New Password</label>
          <input type="password" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
          <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} className={inputCls} />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default StudentProfile;
