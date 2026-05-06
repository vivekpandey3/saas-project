import mongoose from "mongoose";
import { env } from "./env.js"; // ✅ FIXED

export const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};