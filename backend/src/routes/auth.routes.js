import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, experience, skills, githubUrl, linkedinUrl } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        password: hashed,
        experience: experience || 0,
        skills: skills || [],
        githubUrl: githubUrl || '',
        linkedinUrl: linkedinUrl || '',
      });

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email, experience: user.experience, skills: user.skills },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user?.password) return res.status(401).json({ message: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        user: { id: user._id, name: user.name, email: user.email, experience: user.experience, skills: user.skills },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, experience: user.experience, skills: user.skills },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, experience, skills, githubUrl, linkedinUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, experience, skills, githubUrl, linkedinUrl },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
