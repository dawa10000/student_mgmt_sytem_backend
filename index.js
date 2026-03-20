import express from 'express';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';


const app = express();

dotenv.config({ quiet: true });

mongoose.connect(process.env.DB_URL).then((val) => {
  app.listen(5000, () => {
    console.log("DB connected and Server is running on port 5000");
  });

}).catch((err) => {
  console.log(err)
});

app.use(cors({
  credentials: true,
  origin: ['http://localhost:5173','https://student-management-system-frontend-ivory.vercel.app']
}));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }
}));

app.use(express.json());
app.use(express.static('uploads'));
app.get('/', (req, res) => {

  return res.status(200).json({
    message: "Welcome to backend"
  });
});

app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);


