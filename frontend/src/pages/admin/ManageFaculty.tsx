import React, { useState } from "react";
import { mockFaculty } from "@/utils/mockData";
import { Ban, Eye } from "lucide-react";
import { toast } from "sonner";

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState(mockFaculty.map(f => ({ ...f, status: "Active", totalSlots: Math.floor(Math.random() * 50) + 10, totalAppointments: Math.floor(Math.random() * 40) + 5 })));

  const toggle = (id: string) => {
    setFaculty(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f));
    toast.success("Faculty status updated");
  };

  return (
    <div className="page-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground">Manage Faculty</h2>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Designation</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Total Slots</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Appointments</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{f.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.department}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{f.designation}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{f.totalSlots}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{f.totalAppointments}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${f.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{f.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(f.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Ban className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFaculty;
