import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";
import DocRoutes from "./routes/career.routes";
import adminRoutes from "./routes/admin.routes";
import { connectDB } from "./configs/db.config";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api/career", DocRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

let dbConnected = false;
async function initDB() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await initDB();
  return serverless(app)(event, context);
};
