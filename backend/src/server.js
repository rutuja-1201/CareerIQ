import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, aiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import jobDescriptionRoutes from './routes/jobDescription.routes.js';
import skillGapRoutes from './routes/skillGap.routes.js';
import resumeBulletRoutes from './routes/resumeBullet.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import salaryRoutes from './routes/salary.routes.js';
import applicationRoutes from './routes/application.routes.js';
import githubRoutes from './routes/github.routes.js';
import careerGrowthRoutes from './routes/careerGrowth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import intelligenceRoutes from './routes/intelligence.routes.js';
import careerTwinRoutes from './routes/careerTwin.routes.js';
import resumeBuilderRoutes from './routes/resumeBuilder.routes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'CareerIQ API', team: 'Bytebrains' }));

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/resumes', uploadLimiter, resumeRoutes);
app.use('/api/intelligence', aiLimiter, intelligenceRoutes);
app.use('/api/career-twin', aiLimiter, careerTwinRoutes);
app.use('/api/resume-builder', aiLimiter, resumeBuilderRoutes);

// Standard routes
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/resume-bullets', resumeBulletRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/career-growth', careerGrowthRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => console.log(`CareerIQ API running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Set PORT in .env or stop the other process.`);
        process.exit(1);
      }
      throw err;
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
