import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Appointment, Notification, mockAppointments, mockNotifications } from "@/utils/mockData";

interface AppointmentContextType {
  appointments: Appointment[];
  notifications: Notification[];
  unreadCount: number;
  fetchAppointments: () => void;
  addAppointment: (apt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"], reason?: string) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentProvider");
  return ctx;
};

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchAppointments = useCallback(() => {}, []);

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"], reason?: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, rejectionReason: reason || a.rejectionReason } : a));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <AppointmentContext.Provider value={{
      appointments, notifications, unreadCount,
      fetchAppointments, addAppointment, updateAppointmentStatus,
      markAllNotificationsRead, markNotificationRead,
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};
