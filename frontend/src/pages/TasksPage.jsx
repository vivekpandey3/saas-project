import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuthStore } from "../store/authStore";

const emptyTask = { title: "", description: "", status: "todo", priority: "medium" };

export const TasksPage = () => {
  const workspaceId = useAuthStore((state) => state.currentWorkspace?._id);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tasks");
      setTasks(data.tasks);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId) return undefined;
    loadTasks();
    const interval = setInterval(loadTasks, 15000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const createTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/tasks", form);
      setForm(emptyTask);
      toast.success("Task created");
      loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      loadTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Create task</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createTask}>
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Priority
            <select
              value={form.priority}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priority: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <Button className="md:col-span-2" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create task"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Tasks</h2>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-slate-500">
                    {task.status} • {task.priority}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={task.status}
                    onChange={(event) => changeStatus(task._id, event.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  <Button variant="danger" onClick={() => removeTask(task._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
