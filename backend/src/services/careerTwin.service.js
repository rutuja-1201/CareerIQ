import User from '../models/User.js';
import Resume from '../models/Resume.js';
import GithubReport from '../models/GithubReport.js';
import CareerTwin from '../models/CareerTwin.js';
import { JOB_ROLES, getTargetSkillsForRole, buildCompleteRoadmap, normalizeGrowthPlan } from '../constants/jobRoles.js';
import { calculateSkillMatch } from '../utils/skills.js';
import { parseCareerGoalWithAI, generateCareerTwinReply } from './huggingface.service.js';

const ROLE_ALIASES = {
  'senior full stack engineer': 'Senior Full Stack Developer',
  'senior full stack developer': 'Senior Full Stack Developer',
  'full stack engineer': 'Full Stack Developer',
  'full-stack engineer': 'Full Stack Developer',
  'frontend engineer': 'Frontend Developer',
  'backend engineer': 'Backend Developer',
  'devops engineer': 'DevOps Engineer',
  'cloud engineer': 'Cloud Engineer',
  'ml engineer': 'Machine Learning Engineer',
  'machine learning engineer': 'Machine Learning Engineer',
  'sde 2': 'Full Stack Developer',
  'sde-2': 'Full Stack Developer',
  'sde2': 'Full Stack Developer',
  'software engineer ii': 'Full Stack Developer',
};

export const parseGoalFallback = (message) => {
  const lower = message.toLowerCase();
  const monthsMatch = lower.match(/(\d+)\s*months?/);
  const timelineMonths = monthsMatch ? parseInt(monthsMatch[1], 10) : 12;

  for (const [alias, role] of Object.entries(ROLE_ALIASES)) {
    if (lower.includes(alias)) {
      return { targetRole: role, timelineMonths, summary: `Become a ${role} in ${timelineMonths} months` };
    }
  }

  for (const role of JOB_ROLES) {
    const key = role.toLowerCase();
    if (lower.includes(key) || lower.includes(key.replace(' developer', '').replace(' engineer', ''))) {
      return { targetRole: role, timelineMonths, summary: `Become a ${role} in ${timelineMonths} months` };
    }
  }

  if (/senior/i.test(lower) && /full\s*stack/i.test(lower)) {
    return {
      targetRole: 'Senior Full Stack Developer',
      timelineMonths,
      summary: `Become a Senior Full Stack Developer in ${timelineMonths} months`,
    };
  }

  return {
    targetRole: 'Full Stack Developer',
    timelineMonths,
    summary: `Grow into a Full Stack Developer in ${timelineMonths} months`,
  };
};

const gatherUserSkills = async (userId) => {
  const [user, latestResume, latestGithub] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ userId }).sort({ createdAt: -1 }),
    GithubReport.findOne({ userId }).sort({ createdAt: -1 }),
  ]);

  const skills = new Set([
    ...(user?.skills || []),
    ...(latestResume?.skills || []),
    ...(latestGithub?.frameworks || latestGithub?.strengths || []),
  ]);

  return { user, currentSkills: [...skills] };
};

export const generateCareerTwinPlan = async (userId, message) => {
  if (!message?.trim()) throw new Error('Tell Career Twin your career goal');

  let parsed;
  try {
    parsed = await parseCareerGoalWithAI(message);
  } catch {
    parsed = parseGoalFallback(message);
  }

  const targetRole = JOB_ROLES.includes(parsed.targetRole)
    ? parsed.targetRole
    : parseGoalFallback(message).targetRole;
  const timelineMonthsRequested = parsed.timelineMonths || 12;

  const { user, currentSkills } = await gatherUserSkills(userId);
  const targetSkills = getTargetSkillsForRole(targetRole);
  const gap = calculateSkillMatch(currentSkills, targetSkills);
  const plan = normalizeGrowthPlan({}, currentSkills, targetRole);

  const missingSkills = plan.missingSkills.length ? plan.missingSkills : gap.missing;
  const currentReadiness = plan.marketScore ?? gap.match;
  const expectedReadiness = Math.min(94, currentReadiness + Math.round(missingSkills.length * 2.8));
  const estimatedTimelineMonths = Math.max(1, Math.ceil(missingSkills.length / 1.5));
  const onTrack = estimatedTimelineMonths <= timelineMonthsRequested;

  let weeklyLearningPlan = buildCompleteRoadmap(missingSkills);
  const maxWeeks = timelineMonthsRequested * 4;
  if (weeklyLearningPlan.length > maxWeeks) {
    weeklyLearningPlan = weeklyLearningPlan.slice(0, maxWeeks);
  }

  let twinReply = '';
  try {
    twinReply = await generateCareerTwinReply({
      message,
      targetRole,
      currentReadiness,
      expectedReadiness,
      missingSkills,
      estimatedTimelineMonths,
      timelineMonthsRequested,
      currentSkills,
    });
  } catch {
    twinReply = `You're at ${currentReadiness}% readiness for ${targetRole}. Focus on ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? ' and more' : ''} — with consistent effort, you can reach ${expectedReadiness}% readiness in about ${estimatedTimelineMonths} months. I've built your weekly plan below.`;
  }

  const record = await CareerTwin.create({
    userId,
    userMessage: message.trim(),
    interpretedGoal: parsed.summary || `Target: ${targetRole}`,
    targetRole,
    timelineMonthsRequested,
    estimatedTimelineMonths,
    currentReadiness,
    expectedReadiness,
    missingSkills,
    matchedSkills: plan.matchedSkills || gap.matched,
    weeklyLearningPlan,
    twinReply,
  });

  return {
    id: record._id,
    userMessage: message.trim(),
    interpretedGoal: record.interpretedGoal,
    targetRole,
    timelineMonthsRequested,
    estimatedTimelineMonths,
    onTrack,
    currentReadiness,
    expectedReadiness,
    currentSkills,
    missingSkills,
    matchedSkills: record.matchedSkills,
    weeklyLearningPlan,
    twinReply,
  };
};
