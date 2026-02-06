import express from 'express';
import dotenv from 'dotenv';
import DocRoutes from './routes/career.routes';
import cors from 'cors';
import { connectDB } from './configs/db.config';
import { createServer } from 'http';
import { initSocket } from './configs/socket';
import adminRoutes from './routes/admin.routes';

dotenv.config()
const app = express()
app.use(express.json())

app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5000", "http://localhost:3000", "http://localhost:5173","https://kd0l6rn9d9.execute-api.ap-south-1.amazonaws.com/default/ats-scoring-lambda-deploy"],
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE"]
  })
);
app.use("/api/career", DocRoutes)
app.use("/api/admin",adminRoutes)

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    socket: "active",
    timestamp: new Date().toISOString(),
  });
});

connectDB()
const PORT = process.env.PORT || 5000;
const server = createServer(app)
initSocket(server)

server.listen(PORT, () => {
  console.log(`The server is running with Socket on PORT ${PORT}`);
})