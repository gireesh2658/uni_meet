import React, { useState } from "react";
import { Search } from "lucide-react";
import FacultyCard from "@/components/FacultyCard";
import EmptyState from "@/components/EmptyState";
import { mockFaculty } from "@/utils/mockData";

const departments = ["All", "Computer Science", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering", "MBA"];

const FacultyList = () => {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");

  const filtered = mockFaculty.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || f.department === dept;
    return matchSearch && matchDept;
  });

  return (
    <div className="page-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Find Faculty</h2>
        <p className="text-sm text-muted-foreground">Search and browse faculty members to book appointments</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search by name or department…"
          />
        </div>
        <select
          value={dept} onChange={e => setDept(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(f => <FacultyCard key={f.id} faculty={f} />)}
        </div>
      ) : (
        <EmptyState title="No faculty found" description="Try adjusting your search or filter criteria" />
      )}
    </div>
  );
};

export default FacultyList;
