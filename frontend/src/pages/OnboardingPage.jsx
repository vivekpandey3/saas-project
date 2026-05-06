import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";

export const OnboardingPage = () => {
  const setWorkspaces = useAuthStore((state) => state.setWorkspaces);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const res = await api.get("/workspaces");
    setWorkspaces(res.data.workspaces);
  };

  const createWorkspace = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/workspaces", { name: createName });
      setCreateName("");
      await refresh();
      toast.success("Workspace created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const joinWorkspace = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/workspaces/join", { inviteCode: joinCode });
      setJoinCode("");
      await refresh();
      toast.success("Joined workspace");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to join workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Create workspace</h2>
        <form className="space-y-3" onSubmit={createWorkspace}>
          <Input
            label="Workspace name"
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            Create
          </Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Join workspace</h2>
        <form className="space-y-3" onSubmit={joinWorkspace}>
          <Input
            label="Invite code"
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            Join
          </Button>
        </form>
      </Card>
    </div>
  );
};
