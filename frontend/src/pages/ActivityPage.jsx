import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuthStore } from "../store/authStore";

export const ActivityPage = () => {
  const workspaceId = useAuthStore((state) => state.currentWorkspace?._id);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return undefined;
    const load = async () => {
      try {
        const { data } = await api.get("/users/activity");
        setLogs(data.logs);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId]);

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Workspace activity</h2>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-500">No activity logged yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log._id}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <p className="font-medium">{log.action}</p>
              <p className="text-sm text-slate-500">
                {log.actor?.name || "User"} • {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
