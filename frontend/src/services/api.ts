const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => {
  const user = localStorage.getItem("unimeet_user");
  if (user) {
    try { return JSON.parse(user).token; } catch { return null; }
  }
  return null;
};

export const apiClient = {
  async get(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
    });
    if (res.status === 401) { localStorage.removeItem("unimeet_user"); window.location.href = "/login"; }
    return res.json();
  },
  async post(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.status === 401) { localStorage.removeItem("unimeet_user"); window.location.href = "/login"; }
    return res.json();
  },
  async put(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async patch(endpoint: string, data?: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  },
  async delete(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.json();
  },
};
