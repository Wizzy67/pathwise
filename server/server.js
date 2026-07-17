import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Load JSON knowledge base
export const dataCache = {
  careers: JSON.parse(fs.readFileSync(path.join(__dirname, 'data/careers.json'), 'utf8')),
  courses: JSON.parse(fs.readFileSync(path.join(__dirname, 'data/courses.json'), 'utf8')),
  questions: JSON.parse(fs.readFileSync(path.join(__dirname, 'data/questions.json'), 'utf8')),
  translations: JSON.parse(fs.readFileSync(path.join(__dirname, 'data/translations.json'), 'utf8')),
};

// Simple logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import routes (we will create these next)
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import geminiRoutes from './routes/gemini.js';
import quizRoutes from './routes/quiz.js';
import resultsRoutes from './routes/results.js';
import jobsRoutes from './routes/jobs.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/jobs', jobsRoutes);

// Get static data endpoints
app.get('/api/data/careers', (req, res) => res.json(dataCache.careers));
app.get('/api/data/courses', (req, res) => res.json(dataCache.courses));
app.get('/api/data/questions', (req, res) => res.json(dataCache.questions));
app.get('/api/data/translations', (req, res) => res.json(dataCache.translations));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 PathWise Server running on port ${PORT}`);
});

