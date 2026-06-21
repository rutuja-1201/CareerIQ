import Resume from '../models/Resume.js';
import GithubReport from '../models/GithubReport.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import CareerGrowth from '../models/CareerGrowth.js';
import User from '../models/User.js';
import { extractTextFromPDF } from './pdf.service.js';
import { extractSkillsFromResume, computeSkillGap } from './skillGap.service.js';
import { calculateATSScore } from './ats.service.js';
import { analyzeResumeWithAI, generateLearningRoadmap, generateCareerGrowthPlan, generateInterviewPreview } from './huggingface.service.js';
import { analyzeGithubProfile } from './github.service.js';
import { getTargetSkillsForRole, buildCompleteRoadmap, normalizeGrowthPlan } from '../constants/jobRoles.js';

const mergeSkills = (...lists) => [...new Set(lists.flat().filter(Boolean))];

const parseSalaryLpa = (value) => {
  if (!value) return null;
  const num = parseFloat(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(num) ? num : null;
};

export const computeCareerProjection = (currentLpa, marketScore, missingSkills) => {
  const expectedReadiness = Math.min(94, marketScore + Math.round(missingSkills.length * 2.8));
  const base = currentLpa || 6;
  const low = Math.max(base + 2, Math.round(base * 1.35 + missingSkills.length * 0.6));
  const high = Math.max(low + 2, Math.round(base * 1.75 + missingSkills.length * 1.1));
  return {
    currentReadiness: marketScore,
    expectedReadiness,
    potentialSalaryRange: `${low}–${high} LPA`,
    salaryIncrease: `+${low - base} to +${high - base} LPA`,
  };
};

export const runCareerIntelligenceScan = async ({
  userId,
  file,
  githubUsername,
  targetRole,
  currentSalary,
}) => {
  if (!targetRole?.trim()) throw new Error('Target role is required');
  if (!file && !githubUsername?.trim()) {
    throw new Error('Upload a resume or enter your GitHub username');
  }

  const user = await User.findById(userId);
  let resumeResult = null;
  let githubResult = null;
  let resumeSkills = [];
  let githubSkills = [];

  if (file) {
    const extractedText = await extractTextFromPDF(file.buffer);
    if (!extractedText) throw new Error('Could not extract text from PDF');

    resumeSkills = extractSkillsFromResume(extractedText);
    const targetSkills = getTargetSkillsForRole(targetRole);
    const algorithmScore = calculateATSScore(extractedText, targetSkills.join(' '), resumeSkills, targetSkills, user?.experience || 0, 0);

    let aiAnalysis = {};
    try {
      aiAnalysis = await analyzeResumeWithAI(extractedText, `Target role: ${targetRole}. Required skills: ${targetSkills.join(', ')}`);
    } catch {
      aiAnalysis = {};
    }

    const weakBullets = aiAnalysis.weakBullets?.length
      ? aiAnalysis.weakBullets
      : (aiAnalysis.suggestedBullets || []).map((b) =>
          typeof b === 'string' ? { before: b, after: b } : b
        );

    const resume = await Resume.create({
      userId,
      fileName: file.originalname,
      extractedText,
      skills: resumeSkills,
      atsScore: aiAnalysis.atsScore ?? algorithmScore.atsScore,
      missingKeywords: aiAnalysis.missingKeywords || algorithmScore.missingKeywords,
      strengths: aiAnalysis.strengths || algorithmScore.strengths,
      feedback: aiAnalysis.feedback || '',
      resumeQuality: aiAnalysis.resumeQuality || (algorithmScore.atsScore >= 75 ? 'Strong' : algorithmScore.atsScore >= 55 ? 'Good' : 'Needs Work'),
      weakBullets,
    });

    resumeResult = {
      id: resume._id,
      fileName: resume.fileName,
      atsScore: resume.atsScore,
      resumeQuality: resume.resumeQuality,
      missingKeywords: resume.missingKeywords,
      strengths: resume.strengths,
      skills: resume.skills,
      feedback: resume.feedback,
      weakBullets: resume.weakBullets,
    };
  }

  if (githubUsername?.trim()) {
    const username = githubUsername.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
    const analysis = await analyzeGithubProfile(username);
    const report = await GithubReport.create({ userId, ...analysis });
    githubResult = {
      id: report._id,
      username: report.username,
      developerScore: report.developerScore,
      strengths: report.strengths,
      frameworks: report.frameworks || report.strengths,
      languages: report.languages,
      topics: report.topics || [],
      totalRepos: report.totalRepos,
      totalStars: report.totalStars,
      totalCommits: report.totalCommits,
      recentActivity: report.recentActivity,
      topRepos: report.topRepos,
    };
    githubSkills = analysis.frameworks || analysis.strengths || [];
    if (user && !user.githubUrl) {
      user.githubUrl = `https://github.com/${username}`;
      await user.save();
    }
  }

  const currentSkills = mergeSkills(user?.skills || [], resumeSkills, githubSkills);
  if (user) {
    user.skills = currentSkills;
    await user.save();
  }

  const targetSkills = getTargetSkillsForRole(targetRole);
  const gap = computeSkillGap(currentSkills, targetSkills);

  let learningRoadmap = [];
  if (gap.missing.length) {
    try {
      const aiRoadmap = await generateLearningRoadmap(gap.missing);
      learningRoadmap = aiRoadmap.length >= gap.missing.length ? aiRoadmap : buildCompleteRoadmap(gap.missing);
    } catch {
      learningRoadmap = buildCompleteRoadmap(gap.missing);
    }
  }

  const skillAnalysis = await SkillAnalysis.create({
    userId,
    resumeId: resumeResult?.id,
    resumeSkills: gap.resumeSkills,
    jdSkills: gap.jdSkills,
    match: gap.match,
    missing: gap.missing,
    matched: gap.matched,
    learningRoadmap,
  });

  let aiPlan = {};
  try {
    aiPlan = await generateCareerGrowthPlan(currentSkills, targetRole);
  } catch {
    aiPlan = {};
  }

  const plan = normalizeGrowthPlan(aiPlan, currentSkills, targetRole);
  const currentLpa = parseSalaryLpa(currentSalary) ?? parseSalaryLpa(user?.currentSalary) ?? 6;
  const projection = computeCareerProjection(currentLpa, plan.marketScore, plan.missingSkills);

  const careerRecord = await CareerGrowth.create({
    userId,
    currentSkills,
    targetRole: targetRole.trim(),
    currentSalaryLpa: currentLpa,
    ...plan,
    expectedReadiness: projection.expectedReadiness,
    potentialSalaryRange: projection.potentialSalaryRange,
  });

  let interviewPreview = null;
  try {
    interviewPreview = await generateInterviewPreview(
      resumeResult?.feedback || '',
      currentSkills,
      targetRole
    );
  } catch {
    interviewPreview = {
      technical: ['Explain the JavaScript event loop and how async/await maps to it.'],
      hr: ['Tell me about yourself and why you want this role.'],
      projectBased: ['How did you scale MongoDB or handle database performance in a project?'],
      architecture: ['Design a Next.js frontend → Node.js API → MongoDB Atlas system with caching.'],
    };
  }

  return {
    targetRole: targetRole.trim(),
    currentSkills,
    targetSkills,
    resume: resumeResult,
    github: githubResult,
    skillGap: {
      id: skillAnalysis._id,
      match: gap.match,
      missing: gap.missing,
      matched: gap.matched,
      learningRoadmap,
    },
    careerGrowth: {
      id: careerRecord._id,
      currentSalaryLpa: currentLpa,
      marketScore: plan.marketScore,
      expectedReadiness: projection.expectedReadiness,
      missingSkills: plan.missingSkills,
      matchedSkills: plan.matchedSkills,
      estimatedLearningMonths: plan.estimatedLearningMonths,
      salaryIncrease: projection.salaryIncrease,
      potentialSalaryRange: projection.potentialSalaryRange,
      roadmap: plan.roadmap,
    },
    interviewPreview,
  };
};
