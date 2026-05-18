import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuthStore } from "../store/authStore";

export const TeamPage = () => {
  const workspaceId = useAuthStore(
    (state) => state.currentWorkspace?._id
  );

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    position: "Developer",
    role: "member",
  });

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    const load = async () => {
      try {
        const { data } = await api.get(
          `/team/${workspaceId}`
        );

        setUsers(data.users);

      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to load team"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [workspaceId]);

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      setAdding(true);

      await api.post("/team/add", {
        workspaceId,
        ...formData,
      });

      toast.success("Member added successfully");

      const { data } = await api.get(
        `/team/${workspaceId}`
      );

      setUsers(data.users);

      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        position: "Developer",
        role: "member",
      });

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to add member"
      );
    } finally {
      setAdding(false);
    }
  };
  const handleDeleteMember = async (memberId) => {
  try {
    await api.delete(`/team/${memberId}`);

    toast.success("Member deleted");

    const { data } = await api.get(
      `/team/${workspaceId}`
    );

    setUsers(data.users);

  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        "Failed to delete member"
    );
  }
};

  return (
    <Card>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold">
          Team Management
        </h2>

        <p className="text-sm text-slate-500">
          Add and manage workspace members
        </p>
      </div>

      <form
        onSubmit={handleAddMember}
        className="mb-6 grid gap-3 md:grid-cols-2"
      >
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({
              ...formData,
              firstName: e.target.value,
            })
          }
          className="rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
          required
        />

        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({
              ...formData,
              lastName: e.target.value,
            })
          }
          className="rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
          required
        />

        <select
          value={formData.position}
          onChange={(e) =>
            setFormData({
              ...formData,
              position: e.target.value,
            })
          }
          className="rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <option>CEO</option>
          <option>CTO</option>
          <option>Developer</option>
          <option>Tester</option>
          <option>DevOps</option>
          <option>Operational</option>
          <option>Manager</option>
          <option>Designer</option>
          <option>Sales</option>
          <option>Marketing</option>
        </select>

        <select
          value={formData.role}
          onChange={(e) =>
            setFormData({
              ...formData,
              role: e.target.value,
            })
          }
          className="rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Member"}
        </button>
      </form>

      <h2 className="mb-3 text-lg font-semibold">
        Team Members
      </h2>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {users?.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
            >
              <div>
                <p className="font-semibold">
                  {user.firstName} {user.lastName}
                </p>

                <p className="text-sm text-slate-500">
                  {user.email}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {user.position}
                </p>
              </div>

           <div className="flex items-center gap-3">
  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium capitalize dark:bg-slate-800">
    {user.role}
  </span>

  <button
    onClick={() => handleDeleteMember(user._id)}
    className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
  >
    Delete
  </button>
</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};