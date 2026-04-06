import React, { useState } from "react";
import { mockStudents, mockFaculty } from "@/utils/mockData";
import { Search, Plus, Eye, Ban, Trash2, X } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import { toast } from "sonner";

type MockUser = { id: string; name: string; email: string; role: string; department?: string; status?: string; registeredOn?: string };

const allUsers: MockUser[] = [
  ...mockStudents.map(s => ({ ...s, status: "Active", registeredOn: "2024-08-15" })),
  ...mockFaculty.map(f => ({ ...f, status: "Active", registeredOn: "2024-06-01" })),
  { id: "a1", name: "Admin User", email: "admin@university.edu", role: "admin", status: "Active", registeredOn: "2024-01-01" },
];

const ManageUsers = () => {
  const [users, setUsers] = useState(allUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
    toast.success("User status updated");
  };

  const handleDelete = () => {
    if (deleteId) {
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      toast.success("User deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="page-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Manage Users</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search users…" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try a different search or filter" />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Department</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.department || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleStatus(u.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" title={u.status === "Active" ? "Suspend" : "Activate"}><Ban className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(u.id)} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal open={!!deleteId} title="Delete User" message="This action cannot be undone. Are you sure?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />

      {/* Add user modal - simplified */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg page-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAdd(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            <h3 className="text-lg font-semibold text-foreground">Add New User</h3>
            <p className="text-sm text-muted-foreground mt-1">This would connect to the registration API in production.</p>
            <div className="mt-4 space-y-3">
              <input placeholder="Full Name" className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input placeholder="Email" className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <select className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>Student</option><option>Faculty</option><option>Admin</option>
              </select>
              <button onClick={() => { setShowAdd(false); toast.success("User created (mock)"); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
