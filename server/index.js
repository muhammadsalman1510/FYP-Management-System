import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import projectRoutes from './routes/project.routes.js'


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health route
app.get('/health', (req, res) => {
    res.json({ message: 'The server is working!' });
});

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)

// Port config (add fallback to avoid undefined)
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});