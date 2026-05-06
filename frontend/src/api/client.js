import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const { token, currentWorkspace } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (currentWorkspace?._id) {
    config.headers["x-workspace-id"] = currentWorkspace._id;
  }

  return config;
});
