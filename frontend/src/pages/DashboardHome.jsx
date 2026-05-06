import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";

export const DashboardHome = () => {
  const { user, currentWorkspace, workspaces } = useAuthStore();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <p className="text-sm text-slate-500">Current workspace</p>
        <h2 className="mt-2 text-lg font-semibold">{currentWorkspace?.name || "None"}</h2>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Logged in as</p>
        <h2 className="mt-2 text-lg font-semibold">{user?.email}</h2>
      </Card>
      <Card>
        <p className="text-sm text-slate-500">Workspaces joined</p>
        <h2 className="mt-2 text-lg font-semibold">{workspaces.length}</h2>
      </Card>
    </div>
  );
};
