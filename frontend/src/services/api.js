const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const handleResponse = async (res, originalRequestParams) => {
  if (res.status === 401) {
    if (window.location.pathname === "/login" || window.location.pathname === "/register") {
      return res.json();
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshRes.ok) {
          isRefreshing = false;
          processQueue(null, true);
          // Retry original request
          const retryRes = await fetch(originalRequestParams.url, originalRequestParams.options);
          return retryRes.json();
        } else {
          throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem("unimeet_user");
        window.location.href = "/login";
        return { success: false, message: "Session expired" };
      }
    } else {
      // If currently refreshing, wait into queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(async () => {
        const retryRes = await fetch(originalRequestParams.url, originalRequestParams.options);
        return retryRes.json();
      }).catch(err => {
        return Promise.reject(err);
      });
    }
  }
  return res.json();
};

export const apiClient = {
  async get(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    const options = { credentials: "include", headers: { "Content-Type": "application/json" } };
    const res = await fetch(url, options);
    return handleResponse(res, { url, options });
  },
  async post(endpoint, data) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    const res = await fetch(url, options);
    return handleResponse(res, { url, options });
  },
  async put(endpoint, data) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    const res = await fetch(url, options);
    return handleResponse(res, { url, options });
  },
  async patch(endpoint, data) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: data !== undefined ? JSON.stringify(data) : undefined
    };
    const res = await fetch(url, options);
    return handleResponse(res, { url, options });
  },
  async delete(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method: "DELETE",
      credentials: "include"
    };
    const res = await fetch(url, options);
    return handleResponse(res, { url, options });
  }
};