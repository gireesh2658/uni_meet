import { addDays, subDays, setHours, setMinutes, format } from "date-fns";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  department?: string;
  studentId?: string;
  employeeId?: string;
  designation?: string;
  bio?: string;
  phone?: string;
  officeRoom?: string;
}

export interface Faculty extends User {
  role: "faculty";
  department: string;
  designation: string;
  bio: string;
  employeeId: string;
}

export interface TimeSlot {
  id: string;
  facultyId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  createdAt: string;
  rejectionReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "confirmed" | "rejected" | "cancelled" | "reminder" | "new_request";
  message: string;
  timestamp: string;
  isRead: boolean;
}

const today = new Date();

export const mockFaculty: Faculty[] = [
  {
    id: "f1", name: "Dr. Ramesh Sharma", email: "ramesh.sharma@university.edu",
    role: "faculty", department: "Computer Science", designation: "Professor",
    bio: "Professor with 20+ years of experience in AI and Machine Learning. Published over 50 research papers in international journals.",
    employeeId: "EMP001", phone: "+91 98765 43210", officeRoom: "CS-301"
  },
  {
    id: "f2", name: "Prof. Anitha Krishnan", email: "anitha.k@university.edu",
    role: "faculty", department: "Electronics & Communication", designation: "Associate Professor",
    bio: "Specializes in VLSI Design and Embedded Systems. Mentored 30+ M.Tech students.",
    employeeId: "EMP002", phone: "+91 98765 43211", officeRoom: "ECE-205"
  },
  {
    id: "f3", name: "Dr. Suresh Patel", email: "suresh.patel@university.edu",
    role: "faculty", department: "Mechanical Engineering", designation: "HOD",
    bio: "Head of Department with expertise in Thermodynamics and Fluid Mechanics. Industry consultant for leading automotive companies.",
    employeeId: "EMP003", phone: "+91 98765 43212", officeRoom: "ME-101"
  },
  {
    id: "f4", name: "Dr. Kavitha Nair", email: "kavitha.nair@university.edu",
    role: "faculty", department: "Computer Science", designation: "Assistant Professor",
    bio: "Focuses on Cybersecurity and Cloud Computing. Active contributor to open-source projects.",
    employeeId: "EMP004", phone: "+91 98765 43213", officeRoom: "CS-204"
  },
  {
    id: "f5", name: "Prof. Arun Mehta", email: "arun.mehta@university.edu",
    role: "faculty", department: "MBA", designation: "Professor",
    bio: "Expert in Strategic Management and Entrepreneurship. Founded the university's startup incubation center.",
    employeeId: "EMP005", phone: "+91 98765 43214", officeRoom: "MBA-102"
  },
];

export const mockStudents: User[] = [
  { id: "s1", name: "Priya Deshmukh", email: "priya.d@student.edu", role: "student", department: "Computer Science", studentId: "STU2024001" },
  { id: "s2", name: "Arjun Reddy", email: "arjun.r@student.edu", role: "student", department: "Electronics & Communication", studentId: "STU2024002" },
  { id: "s3", name: "Sneha Iyer", email: "sneha.i@student.edu", role: "student", department: "MBA", studentId: "STU2024003" },
  { id: "s4", name: "Vikram Singh", email: "vikram.s@student.edu", role: "student", department: "Mechanical Engineering", studentId: "STU2024004" },
  { id: "s5", name: "Meera Joshi", email: "meera.j@student.edu", role: "student", department: "Computer Science", studentId: "STU2024005" },
];

const generateSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"];
  for (let d = 0; d < 7; d++) {
    const date = format(addDays(today, d), "yyyy-MM-dd");
    mockFaculty.forEach((f) => {
      times.forEach((t, i) => {
        const endIdx = i + 1 < times.length ? times[i + 1] : "05:00 PM";
        slots.push({
          id: `slot-${f.id}-${d}-${i}`,
          facultyId: f.id,
          date,
          startTime: t,
          endTime: endIdx,
          duration: 30,
          isBooked: Math.random() > 0.6,
        });
      });
    });
  }
  return slots;
};

export const mockSlots: TimeSlot[] = generateSlots();

export const mockAppointments: Appointment[] = [
  {
    id: "apt1", studentId: "s1", studentName: "Priya Deshmukh", facultyId: "f1", facultyName: "Dr. Ramesh Sharma",
    department: "Computer Science", date: format(addDays(today, 1), "yyyy-MM-dd"),
    startTime: "10:00 AM", endTime: "10:30 AM",
    purpose: "Discussion about final year project on Machine Learning-based sentiment analysis",
    status: "approved", createdAt: format(subDays(today, 2), "yyyy-MM-dd"),
  },
  {
    id: "apt2", studentId: "s2", studentName: "Arjun Reddy", facultyId: "f2", facultyName: "Prof. Anitha Krishnan",
    department: "Electronics & Communication", date: format(addDays(today, 2), "yyyy-MM-dd"),
    startTime: "11:00 AM", endTime: "11:30 AM",
    purpose: "Guidance on VLSI project implementation and lab requirements",
    status: "pending", createdAt: format(subDays(today, 1), "yyyy-MM-dd"),
  },
  {
    id: "apt3", studentId: "s3", studentName: "Sneha Iyer", facultyId: "f5", facultyName: "Prof. Arun Mehta",
    department: "MBA", date: format(today, "yyyy-MM-dd"),
    startTime: "02:00 PM", endTime: "02:30 PM",
    purpose: "Review of business plan for entrepreneurship competition",
    status: "approved", createdAt: format(subDays(today, 3), "yyyy-MM-dd"),
  },
  {
    id: "apt4", studentId: "s4", studentName: "Vikram Singh", facultyId: "f3", facultyName: "Dr. Suresh Patel",
    department: "Mechanical Engineering", date: format(subDays(today, 1), "yyyy-MM-dd"),
    startTime: "09:00 AM", endTime: "09:30 AM",
    purpose: "Discuss internship opportunities in automotive sector",
    status: "completed", createdAt: format(subDays(today, 5), "yyyy-MM-dd"),
  },
  {
    id: "apt5", studentId: "s5", studentName: "Meera Joshi", facultyId: "f4", facultyName: "Dr. Kavitha Nair",
    department: "Computer Science", date: format(addDays(today, 3), "yyyy-MM-dd"),
    startTime: "03:00 PM", endTime: "03:30 PM",
    purpose: "Cloud computing course doubt clearing session",
    status: "pending", createdAt: format(today, "yyyy-MM-dd"),
  },
  {
    id: "apt6", studentId: "s1", studentName: "Priya Deshmukh", facultyId: "f4", facultyName: "Dr. Kavitha Nair",
    department: "Computer Science", date: format(subDays(today, 3), "yyyy-MM-dd"),
    startTime: "10:00 AM", endTime: "10:30 AM",
    purpose: "Career counselling for higher studies abroad",
    status: "rejected", createdAt: format(subDays(today, 6), "yyyy-MM-dd"),
    rejectionReason: "Schedule conflict with department meeting",
  },
  {
    id: "apt7", studentId: "s2", studentName: "Arjun Reddy", facultyId: "f1", facultyName: "Dr. Ramesh Sharma",
    department: "Computer Science", date: format(subDays(today, 2), "yyyy-MM-dd"),
    startTime: "11:30 AM", endTime: "12:00 PM",
    purpose: "Research paper review and publication guidance",
    status: "completed", createdAt: format(subDays(today, 7), "yyyy-MM-dd"),
  },
  {
    id: "apt8", studentId: "s3", studentName: "Sneha Iyer", facultyId: "f5", facultyName: "Prof. Arun Mehta",
    department: "MBA", date: format(addDays(today, 4), "yyyy-MM-dd"),
    startTime: "10:00 AM", endTime: "10:30 AM",
    purpose: "Discuss case study for strategic management course",
    status: "pending", createdAt: format(today, "yyyy-MM-dd"),
  },
  {
    id: "apt9", studentId: "s4", studentName: "Vikram Singh", facultyId: "f3", facultyName: "Dr. Suresh Patel",
    department: "Mechanical Engineering", date: format(subDays(today, 4), "yyyy-MM-dd"),
    startTime: "02:30 PM", endTime: "03:00 PM",
    purpose: "Lab equipment requisition discussion",
    status: "cancelled", createdAt: format(subDays(today, 8), "yyyy-MM-dd"),
  },
  {
    id: "apt10", studentId: "s5", studentName: "Meera Joshi", facultyId: "f1", facultyName: "Dr. Ramesh Sharma",
    department: "Computer Science", date: format(addDays(today, 5), "yyyy-MM-dd"),
    startTime: "09:30 AM", endTime: "10:00 AM",
    purpose: "Recommendation letter request for internship application",
    status: "approved", createdAt: format(subDays(today, 1), "yyyy-MM-dd"),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1", userId: "s1", type: "confirmed",
    message: "Your appointment with Dr. Ramesh Sharma on " + format(addDays(today, 1), "dd MMM") + " has been approved.",
    timestamp: subDays(today, 0.1).toISOString(), isRead: false,
  },
  {
    id: "n2", userId: "s1", type: "rejected",
    message: "Your appointment request with Dr. Kavitha Nair was declined. Reason: Schedule conflict.",
    timestamp: subDays(today, 1).toISOString(), isRead: false,
  },
  {
    id: "n3", userId: "s1", type: "reminder",
    message: "Reminder: You have a meeting with Dr. Ramesh Sharma tomorrow at 10:00 AM.",
    timestamp: subDays(today, 0.5).toISOString(), isRead: true,
  },
  {
    id: "n4", userId: "f1", type: "new_request",
    message: "New appointment request from Meera Joshi for " + format(addDays(today, 5), "dd MMM") + ".",
    timestamp: subDays(today, 1).toISOString(), isRead: false,
  },
  {
    id: "n5", userId: "f1", type: "cancelled",
    message: "Vikram Singh has cancelled the appointment scheduled for " + format(subDays(today, 4), "dd MMM") + ".",
    timestamp: subDays(today, 4).toISOString(), isRead: true,
  },
];

export const mockWeeklyAppointments = [
  { day: "Mon", count: 5 },
  { day: "Tue", count: 8 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 6 },
  { day: "Sat", count: 2 },
  { day: "Sun", count: 0 },
];

export const mockMonthlyTrend = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(today, 29 - i), "dd MMM"),
  appointments: Math.floor(Math.random() * 15) + 2,
}));

export const mockDepartmentStats = [
  { department: "Computer Science", count: 45 },
  { department: "ECE", count: 32 },
  { department: "Mechanical", count: 28 },
  { department: "MBA", count: 20 },
  { department: "Civil", count: 15 },
];

export const mockTopFaculty = [
  { name: "Dr. Ramesh Sharma", bookings: 42 },
  { name: "Prof. Anitha Krishnan", bookings: 35 },
  { name: "Dr. Suresh Patel", bookings: 30 },
  { name: "Dr. Kavitha Nair", bookings: 28 },
  { name: "Prof. Arun Mehta", bookings: 22 },
];
