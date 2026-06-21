import express from 'express';
import InterviewQuestion from '../models/InterviewQuestion.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { generateInterviewQuestions } from '../services/huggingface.service.js';
import { getTargetSkillsForRole } from '../constants/jobRoles.js';

const router = express.Router();

const fallbackQuestions = {
  frontend: [
    'Explain the React virtual DOM and reconciliation process.',
    'What is the difference between useMemo and useCallback?',
    'How does Next.js App Router differ from Pages Router?',
    'Explain CSS specificity and BEM methodology.',
    'What are Web Vitals and how do you optimize them?',
  ],
  backend: [
    'Explain the Node.js event loop.',
    'What is the difference between SQL and NoSQL databases?',
    'How do you handle authentication in REST APIs?',
    'Explain middleware in Express.js.',
    'What are database indexes and when should you use them?',
  ],
  systemDesign: [
    'How would you design a URL shortener?',
    'Design an expense tracker handling 1 million transactions.',
    'How would you scale a real-time chat application?',
    'Explain caching strategies for a high-traffic API.',
    'How would you design a job queue system?',
  ],
  behavioral: [
    'Tell me about a challenging bug you fixed.',
    'Describe a time you disagreed with a teammate.',
    'How do you prioritize tasks under tight deadlines?',
    'Tell me about a project you are most proud of.',
    'How do you stay updated with new technologies?',
  ],
};

router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId, targetRole } = req.body;
    const user = await User.findById(req.userId);

    let resumeText = '';
    let jdText = '';

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
      resumeText = resume?.extractedText || '';
    }
    if (jobDescriptionId) {
      const jd = await JobDescription.findOne({ _id: jobDescriptionId, userId: req.userId });
      jdText = jd?.rawText || '';
    } else if (targetRole?.trim()) {
      const skills = getTargetSkillsForRole(targetRole);
      jdText = `${targetRole}\nRequired skills: ${skills.join(', ')}`;
    }

    let questions = fallbackQuestions;
    try {
      questions = await generateInterviewQuestions(
        resumeText || user?.skills?.join(', ') || 'Software developer',
        user?.experience || 0,
        jdText || 'Full stack developer role'
      );
    } catch {}

    const record = await InterviewQuestion.create({
      userId: req.userId,
      resumeId: resumeId || undefined,
      jobDescriptionId: jobDescriptionId || undefined,
      ...questions,
    });

    res.status(201).json({ questions: record });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const questions = await InterviewQuestion.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    next(err);
  }
});

export default router;
