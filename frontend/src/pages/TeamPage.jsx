import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuthStore } from "../store/authStore";

export const TeamPage = () => {
  const workspaceId = useAuthStore((state) => state.currentWorkspace?._id);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return undefined;
    const load = async () => {
      try {
        const { data } = await api.get("/users/team");
        setUsers(data.users);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId]);

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">Team members</h2>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium dark:bg-slate-800">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
