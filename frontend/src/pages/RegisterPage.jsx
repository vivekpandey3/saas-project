import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setWorkspaces = useAuthStore((state) => state.setWorkspaces);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    workspaceName: ""
  });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data);
      const workspaceRes = await api.get("/workspaces");
      setWorkspaces(workspaceRes.data.workspaces);
      toast.success("Account created");
      navigate("/app");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-white p-4 dark:from-slate-900 dark:to-slate-950">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Full name"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            label="Password"
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <Input
            label="Workspace name"
            required
            value={form.workspaceName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, workspaceName: event.target.value }))
            }
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="text-indigo-600" to="/login">
            Sign in
          </Link>
        </p>
        </Card>
      </motion.div>
    </div>
  );
};
