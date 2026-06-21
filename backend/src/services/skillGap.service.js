import { extractSkillsFromText, calculateSkillMatch } from '../utils/skills.js';

export const computeSkillGap = (resumeSkills, jdSkills) => {
  const normalizedResume = resumeSkills.length
    ? resumeSkills
    : [];
  const normalizedJd = jdSkills.length ? jdSkills : [];

  const result = calculateSkillMatch(normalizedResume, normalizedJd);
  return {
    match: result.match,
    missing: result.missing,
    matched: result.matched,
    resumeSkills: normalizedResume,
    jdSkills: normalizedJd,
  };
};

export const extractSkillsFromResume = (text) => extractSkillsFromText(text);

export const extractSkillsFromJD = (text) => extractSkillsFromText(text);
