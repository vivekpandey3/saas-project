import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js"; // ✅ FIXED
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import teamMemberRoutes from "./routes/teamMember.routes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
console.log("TEAM ROUTES LOADED");

app.use("/api/team", teamMemberRoutes);

app.use(notFound);
app.use(errorHandler);