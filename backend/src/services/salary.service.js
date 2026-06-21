import { normalizeSkill } from '../utils/skills.js';

const SKILL_WEIGHTS = {
  React: 1.2, 'Next.js': 1.2, TypeScript: 1.15, 'Node.js': 1.1, AWS: 1.3,
  Docker: 1.15, Kubernetes: 1.4, 'System Design': 1.5, Python: 1.1, Java: 1.1,
  Go: 1.2, Rust: 1.3, Kafka: 1.2, PostgreSQL: 1.05, MongoDB: 1.0,
  GraphQL: 1.1, Microservices: 1.3, 'Machine Learning': 1.4, TensorFlow: 1.3,
};

const CITY_MULTIPLIERS = {
  Nagpur: 0.55,
  Pune: 0.85,
  Bangalore: 1.0,
  Mumbai: 0.95,
  Hyderabad: 0.9,
  Delhi: 0.88,
  Remote: 0.92,
};

const BASE_SALARY = { min: 4, max: 6 };

const getSkillMultiplier = (skills) => {
  if (!skills.length) return 1;
  const total = skills.reduce((sum, skill) => {
    const normalized = normalizeSkill(skill);
    return sum + (SKILL_WEIGHTS[normalized] || 1);
  }, 0);
  return total / skills.length;
};

const formatRange = (min, max) => `${Math.round(min)}-${Math.round(max)} LPA`;

export const predictSalary = (experience, skills) => {
  const expFactor = 1 + experience * 0.35;
  const skillFactor = getSkillMultiplier(skills);
  const baseMin = BASE_SALARY.min * expFactor * skillFactor;
  const baseMax = BASE_SALARY.max * expFactor * skillFactor;

  const predictions = {};
  for (const [city, multiplier] of Object.entries(CITY_MULTIPLIERS)) {
    predictions[city] = formatRange(baseMin * multiplier, baseMax * multiplier);
  }

  return predictions;
};
