import axios from "axios";

const base = (import.meta.env.VITE_API_URL as string) || "";

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired / invalid
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Hard redirect (safe even outside React)
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
