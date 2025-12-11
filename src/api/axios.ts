import axios from "axios";

const base = (import.meta.env.VITE_API_URL as string) || "";

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
