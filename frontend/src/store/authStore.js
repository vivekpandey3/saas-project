import { create } from "zustand";

const persisted = JSON.parse(localStorage.getItem("workspace-auth") || "{}");

export const useAuthStore = create((set, get) => ({
  token: persisted.token || null,
  user: persisted.user || null,
  workspaces: persisted.workspaces || [],
  currentWorkspace: persisted.currentWorkspace || null,
  darkMode: persisted.darkMode || false,
  isBootstrapping: true,
  setAuth: ({ token, user }) => {
    const next = { ...get(), token, user };
    localStorage.setItem(
      "workspace-auth",
      JSON.stringify({
        token: next.token,
        user: next.user,
        workspaces: next.workspaces,
        currentWorkspace: next.currentWorkspace,
        darkMode: next.darkMode
      })
    );
    set({ token, user });
  },
  setWorkspaces: (workspaces) => {
    const currentWorkspace =
      workspaces.find((workspace) => workspace._id === get().currentWorkspace?._id) ||
      workspaces[0] ||
      null;
    const next = { ...get(), workspaces, currentWorkspace };
    localStorage.setItem(
      "workspace-auth",
      JSON.stringify({
        token: next.token,
        user: next.user,
        workspaces: next.workspaces,
        currentWorkspace: next.currentWorkspace,
        darkMode: next.darkMode
      })
    );
    set({ workspaces, currentWorkspace });
  },
  setCurrentWorkspace: (workspaceId) => {
    const currentWorkspace =
      get().workspaces.find((workspace) => workspace._id === workspaceId) || null;
    const next = { ...get(), currentWorkspace };
    localStorage.setItem(
      "workspace-auth",
      JSON.stringify({
        token: next.token,
        user: next.user,
        workspaces: next.workspaces,
        currentWorkspace: next.currentWorkspace,
        darkMode: next.darkMode
      })
    );
    set({ currentWorkspace });
  },
  setBootstrapDone: () => set({ isBootstrapping: false }),
  toggleDarkMode: () => {
    const nextDarkMode = !get().darkMode;
    const next = { ...get(), darkMode: nextDarkMode };
    localStorage.setItem(
      "workspace-auth",
      JSON.stringify({
        token: next.token,
        user: next.user,
        workspaces: next.workspaces,
        currentWorkspace: next.currentWorkspace,
        darkMode: next.darkMode
      })
    );
    set({ darkMode: nextDarkMode });
  },
  logout: () => {
    localStorage.removeItem("workspace-auth");
    set({
      token: null,
      user: null,
      workspaces: [],
      currentWorkspace: null,
      darkMode: false
    });
  }
}));
