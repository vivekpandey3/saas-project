import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js"; // ✅ correct
import { createServer } from "node:http";
import { initSocketServer } from "./services/socket.service.js";

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = createServer(app);
    initSocketServer(httpServer);
    httpServer.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();