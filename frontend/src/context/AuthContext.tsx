import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, mockStudents, mockFaculty } from "@/utils/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("unimeet_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: string): Promise<boolean> => {
    // Mock login
    let foundUser: User | undefined;
    if (role === "student") foundUser = mockStudents[0];
    else if (role === "faculty") foundUser = mockFaculty[0] as User;
    else if (role === "admin") foundUser = { id: "a1", name: "Admin User", email: "admin@university.edu", role: "admin" };
    
    if (foundUser) {
      const u = { ...foundUser, email, role: role as User["role"] };
      setUser(u);
      localStorage.setItem("unimeet_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const register = async (_data: any): Promise<boolean> => {
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unimeet_user");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("unimeet_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
