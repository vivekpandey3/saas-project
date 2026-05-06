import { Bell, ClipboardList, History, LogOut, Moon, Sun, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { to: "/app", label: "Overview", icon: Bell },
  { to: "/app/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/activity", label: "Activity", icon: History }
];

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const {
    user,
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    logout,
    darkMode,
    toggleDarkMode
  } = useAuthStore();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:w-72 lg:border-r lg:border-b-0">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
            <select
              value={currentWorkspace?._id || ""}
              onChange={(event) => setCurrentWorkspace(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <h1 className="text-base font-semibold">{currentWorkspace?.name || "Workspace"}</h1>
              <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
                type="button"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
                type="button"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </header>
          <div className="p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
