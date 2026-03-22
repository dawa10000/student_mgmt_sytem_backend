import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:5173',
    'https://student-management-system-frontend-ivory.vercel.app'
  ]
}));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ===== Test Route =====
app.get('/', (req, res) => {
  return res.status(200).json({ message: "Welcome to backend" });
});

// ===== Routes =====
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ===== Connect DB & Start Server =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DB_URL).then(() => {
  app.listen(PORT, () => {
    console.log(`DB connected and Server running on port ${PORT}`);
  });
})
  .catch((err) => {
    console.error("DB connection error:", err);
  });