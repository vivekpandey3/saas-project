import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Skeleton } from "../components/ui/Skeleton";
import { getSocket } from "../realtime/socket";
import { useAuthStore } from "../store/authStore";

const emptyTask = { title: "", description: "", status: "todo", priority: "medium" };
const columns = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" }
];

const KanbanTaskCard = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { type: "task", task }
  });

  const style = {
    transform: CSS.Translate.toString(transform)
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        isDragging ? "z-20 opacity-70 shadow-xl" : ""
      }`}
    >
      <button
        type="button"
        className="w-full cursor-grab text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <p className={`font-medium ${task.status === "done" ? "line-through text-slate-400" : ""}`}>
          {task.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">{task.priority} priority</p>
        {task.description ? <p className="mt-2 text-sm text-slate-500">{task.description}</p> : null}
      </button>
      <div className="mt-3 flex justify-end">
        <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => onDelete(task._id)}>
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({ id, title, tasks, onDelete }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] flex-col rounded-2xl border p-3 transition ${
        isOver
          ? "border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-500/10"
          : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-800">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <KanbanTaskCard key={task._id} task={task} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export const TasksPage = () => {
  const workspaceId = useAuthStore((state) => state.currentWorkspace?._id);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const groupedTasks = useMemo(
    () =>
      columns.reduce((acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      }, {}),
    [tasks]
  );

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
    return undefined;
  }, [workspaceId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !workspaceId) return undefined;

    const onTaskCreated = ({ task }) => {
      setTasks((prev) => {
        if (prev.some((existing) => existing._id === task._id)) return prev;
        return [task, ...prev];
      });
    };
    const onTaskUpdated = ({ task }) => {
      setTasks((prev) =>
        prev.map((existing) => (existing._id === task._id ? { ...existing, ...task } : existing))
      );
    };
    const onTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    };

    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);

    return () => {
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
    };
  }, [workspaceId]);

  const createTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/tasks", form);
      setForm(emptyTask);
      setShowCreateModal(false);
      toast.success("Task created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (taskId, status, previousStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
    } catch (error) {
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status: previousStatus } : task))
      );
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id;
    const nextStatus = over.id;

    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === nextStatus) return;

    const previousStatus = task.status;
    setTasks((prev) =>
      prev.map((item) => (item._id === taskId ? { ...item, status: nextStatus } : item))
    );
    await changeStatus(taskId, nextStatus, previousStatus);
  };

  const quickMove = async (taskId, nextStatus) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === nextStatus) return;

    const previousStatus = task.status;
    setTasks((prev) =>
      prev.map((item) => (item._id === taskId ? { ...item, status: nextStatus } : item))
    );
    try {
      await changeStatus(taskId, nextStatus, previousStatus);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Kanban Board</h2>
          <p className="text-sm text-slate-500">Drag tasks across columns to update status.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>+ New task</Button>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : (
          <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid gap-3 xl:grid-cols-3">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={groupedTasks[column.id]}
                    onDelete={removeTask}
                  />
                ))}
              </div>
            </DndContext>

            <div className="grid gap-2 rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700 md:grid-cols-3">
              {columns.map((column) => (
                <label key={`quick-${column.id}`} className="text-xs text-slate-500">
                  Move selected task to {column.title}
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    defaultValue=""
                    onChange={(event) => {
                      const [taskId, nextStatus] = event.target.value.split("|");
                      if (taskId && nextStatus) quickMove(taskId, nextStatus);
                      event.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      Quick move
                    </option>
                    {tasks
                      .filter((task) => task.status !== column.id)
                      .map((task) => (
                        <option key={`${column.id}-${task._id}`} value={`${task._id}|${column.id}`}>
                          {task.title}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a new task"
      >
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
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
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
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
