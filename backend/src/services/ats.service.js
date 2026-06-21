import { extractSkillsFromText } from '../utils/skills.js';

export const calculateATSScore = (resumeText, jdText, resumeSkills, jdSkills, userExperience = 0, requiredExperience = 0) => {
  const resumeSkillSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const jdSkillList = jdSkills.length ? jdSkills : [];

  const keywordMatch = jdSkillList.length
    ? (jdSkillList.filter((s) => resumeSkillSet.has(s.toLowerCase())).length / jdSkillList.length) * 100
    : extractSkillsFromText(resumeText).length > 5 ? 70 : 40;

  const skillsMatch = resumeSkills.length
    ? Math.min(100, (resumeSkills.length / Math.max(jdSkillList.length, 5)) * 100)
    : 50;

  const expDiff = requiredExperience ? Math.abs(userExperience - requiredExperience) : 0;
  const experienceMatch = requiredExperience
    ? Math.max(0, 100 - expDiff * 20)
    : userExperience >= 2 ? 85 : 70;

  const atsScore = Math.round(
    keywordMatch * 0.5 + experienceMatch * 0.2 + Math.min(skillsMatch, 100) * 0.3
  );

  const missingKeywords = jdSkillList.filter((s) => !resumeSkillSet.has(s.toLowerCase()));
  const strengths = resumeSkills.filter((s) => jdSkillList.some((j) => j.toLowerCase() === s.toLowerCase()));

  return {
    atsScore: Math.min(100, Math.max(0, atsScore)),
    missingKeywords: missingKeywords.slice(0, 10),
    strengths: strengths.length ? strengths : resumeSkills.slice(0, 5),
  };
};
