import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import DocRoutes from "./routes/career.routes";
import adminRoutes from "./routes/admin.routes";
import { connectDB } from "./configs/db.config";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["POST", "GET", "PUT", "DELETE"]
  })
);

app.use("/api/career", DocRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    runtime: "lambda",
    timestamp: new Date().toISOString()
  });
});

let isConnected = false;

export const initApp = async () => {
  if (!isConnected) {
    console.log("⏳ Connecting to DB...");
    await connectDB();
    isConnected = true;
    console.log("✅ DB connected (Lambda cold start)");
  }
};

export default app;
