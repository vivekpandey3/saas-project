import { useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";

export const useAuthBootstrap = () => {
  const {
    token,
    setAuth,
    setWorkspaces,
    setBootstrapDone,
    darkMode
  } = useAuthStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootstrapDone();
        return;
      }
      try {
        const [{ data: meData }, { data: workspaceData }] = await Promise.all([
          api.get("/auth/me"),
          api.get("/workspaces")
        ]);
        setAuth({ token, user: meData.user });
        setWorkspaces(workspaceData.workspaces);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Session expired. Please login again.");
        useAuthStore.getState().logout();
      } finally {
        setBootstrapDone();
      }
    };

    bootstrap();
  }, [token, setAuth, setBootstrapDone, setWorkspaces]);
};
