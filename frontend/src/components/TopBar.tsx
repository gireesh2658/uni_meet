import React, { useState } from "react";
import { Bell, Menu, ChevronDown, LogOut, User, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAppointments } from "@/context/AppointmentContext";
import { getInitials, getAvatarColor } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

const TopBar = ({ title, onMenuClick }: TopBarProps) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useAppointments();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notifPath = user ? `/${user.role}/notifications` : "/";
  const profilePath = user ? `/${user.role}/profile` : "/";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-foreground" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => navigate(notifPath)}
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            {user && (
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getAvatarColor(user.name)} text-card`}>
                {getInitials(user.name)}
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg page-fade-in">
                <button
                  onClick={() => { navigate(profilePath); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => { navigate(profilePath); setDropdownOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Lock className="h-4 w-4" /> Change Password
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
