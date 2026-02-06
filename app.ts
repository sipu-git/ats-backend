import express from "express";
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
    origin:"*",
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE"]
  })
);

app.use("/api/career", DocRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    runtime: "lambda",
    timestamp: new Date().toISOString()
  });
});

let isConnected = false;

export const initApp = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("DB connected");
  }
};

export default app;
