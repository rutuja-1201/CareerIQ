import express from 'express';
import Application from '../models/Application.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const STATUSES = ['Applied', 'OA', 'Interview', 'Rejected', 'Offer', 'Joined'];

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { company, role, appliedDate, status, salary, notes } = req.body;
    if (!company || !role) return res.status(400).json({ message: 'Company and role required' });
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const application = await Application.create({
      userId: req.userId,
      company,
      role,
      appliedDate: appliedDate || Date.now(),
      status: status || 'Applied',
      salary: salary || '',
      notes: notes || '',
    });

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({ appliedDate: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { status, salary, notes, company, role } = req.body;
    if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status, salary, notes, company, role },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ application });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
