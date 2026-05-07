import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ClipboardList,
  History,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  connectWorkspaceSocket,
  disconnectSocket,
  getSocket
} from "../../realtime/socket";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../api/client";

const navItems = [
  { to: "/app", label: "Overview", icon: Bell },
  { to: "/app/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/activity", label: "Activity", icon: History }
];

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    user,
    workspaces,
    currentWorkspace,
    token,
    setCurrentWorkspace,
    logout,
    darkMode,
    toggleDarkMode
  } = useAuthStore();

  const onLogout = () => {
    disconnectSocket();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!token || !currentWorkspace?._id) {
      setOnlineCount(0);
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    const socket = connectWorkspaceSocket({
      token,
      workspaceId: currentWorkspace._id
    });
    if (!socket) return undefined;

    const onConnectError = () => {
      toast.error("Realtime connection failed");
    };
    const onPresence = (payload) => {
      setOnlineCount(payload?.onlineCount || 0);
    };
    const onNotification = ({ notification }) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setUnreadCount((value) => value + 1);
    };

    socket.on("connect_error", onConnectError);
    socket.on("presence:update", onPresence);
    socket.on("notification:new", onNotification);

    return () => {
      socket.off("connect_error", onConnectError);
      socket.off("presence:update", onPresence);
      socket.off("notification:new", onNotification);
      const activeSocket = getSocket();
      if (activeSocket?.id === socket.id) {
        disconnectSocket();
      }
    };
  }, [token, currentWorkspace?._id]);

  useEffect(() => {
    if (!token || !currentWorkspace?._id) return;
    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/users/notifications");
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load notifications");
      }
    };
    loadNotifications();
  }, [token, currentWorkspace?._id]);

  const markOneRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item))
    );
    setUnreadCount((value) => Math.max(0, value - 1));
    try {
      await api.patch(`/users/notifications/${notificationId}/read`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update notification");
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch("/users/notifications/read-all");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update notifications");
    }
  };

  const workspaceInitials = useMemo(
    () =>
      (currentWorkspace?.name || "W")
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join(""),
    [currentWorkspace]
  );

  const SidebarContent = (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">
            {workspaceInitials}
          </div>
          {!desktopCollapsed && (
            <div>
              <p className="text-xs text-slate-500">Workspace</p>
              <p className="max-w-[130px] truncate text-sm font-semibold">
                {currentWorkspace?.name || "Select workspace"}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDesktopCollapsed((value) => !value)}
          className="hidden rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:block"
          title="Toggle sidebar width"
        >
          {desktopCollapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {!desktopCollapsed && (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace Switcher</p>
          <select
            value={currentWorkspace?._id || ""}
            onChange={(event) => setCurrentWorkspace(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {workspaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon size={16} />
              {!desktopCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        <motion.aside
          animate={{ width: desktopCollapsed ? 88 : 280 }}
          transition={{ duration: 0.22 }}
          className="hidden border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:block"
        >
          {SidebarContent}
        </motion.aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            >
              <motion.aside
                className="h-full w-72 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
              >
                {SidebarContent}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-6 relative">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 dark:border-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={16} />
              </button>
              <div>
                <h1 className="text-base font-semibold">{currentWorkspace?.name || "Workspace"}</h1>
                <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900 md:flex">
              <Search size={15} />
              <span>Search tasks, users...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications((value) => !value)}
                className="relative rounded-xl border border-slate-300 p-2 transition hover:scale-105 dark:border-slate-700"
                type="button"
              >
                <Bell size={16} />
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] text-white">
                  {unreadCount}
                </span>
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-4 top-14 z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-950 md:right-6"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        type="button"
                        className="text-xs text-indigo-600"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-80 space-y-2 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-500">No notifications</p>
                      ) : (
                        notifications.map((item) => (
                          <button
                            type="button"
                            key={item._id}
                            onClick={() => markOneRead(item._id)}
                            className={`w-full rounded-xl border p-2 text-left ${
                              item.isRead
                                ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                                : "border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                            }`}
                          >
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="hidden items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {onlineCount} online
              </div>
              <button
                onClick={toggleDarkMode}
                className="rounded-xl border border-slate-300 p-2 transition hover:scale-105 dark:border-slate-700"
                type="button"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm text-white transition hover:scale-[1.02] hover:bg-rose-700"
                type="button"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
