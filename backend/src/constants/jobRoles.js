import { calculateSkillMatch } from '../utils/skills.js';

export const JOB_ROLES = [
  'Senior Full Stack Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'React Developer',
  'Node.js Developer',
  'Java Developer',
  'Python Developer',
  'Mobile Developer (React Native)',
  'DevOps Engineer',
  'Cloud Engineer',
  'Data Engineer',
  'Machine Learning Engineer',
  'QA / Test Engineer',
  'Technical Lead',
  'Software Architect',
  'Site Reliability Engineer (SRE)',
  'Product Engineer',
];

export const TARGET_SKILLS = {
  'Senior Full Stack Developer': ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL', 'System Design', 'Redis'],
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'REST API', 'Git', 'Docker'],
  'Frontend Developer': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Jest', 'HTML', 'CSS'],
  'Backend Developer': ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kafka', 'System Design'],
  'React Developer': ['React', 'Next.js', 'TypeScript', 'Redux', 'Jest', 'Tailwind CSS', 'REST API', 'Git'],
  'Node.js Developer': ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'REST API', 'JWT'],
  'Java Developer': ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Docker', 'REST API', 'JUnit', 'Kafka'],
  'Python Developer': ['Python', 'Django', 'Flask', 'PostgreSQL', 'REST API', 'Docker', 'Redis', 'FastAPI'],
  'Mobile Developer (React Native)': ['React Native', 'JavaScript', 'TypeScript', 'REST API', 'Redux', 'Firebase', 'Git', 'Jest'],
  'DevOps Engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Jenkins', 'Monitoring'],
  'Cloud Engineer': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Networking'],
  'Data Engineer': ['Python', 'Spark', 'Kafka', 'AWS', 'PostgreSQL', 'Airflow', 'Docker', 'SQL'],
  'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'AWS', 'Docker', 'SQL', 'Pandas'],
  'QA / Test Engineer': ['Jest', 'Cypress', 'Playwright', 'Selenium', 'JavaScript', 'CI/CD', 'REST API', 'Git'],
  'Technical Lead': ['System Design', 'React', 'Node.js', 'AWS', 'Microservices', 'Agile', 'PostgreSQL', 'Docker'],
  'Software Architect': ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'],
  'Site Reliability Engineer (SRE)': ['Linux', 'Kubernetes', 'Docker', 'Monitoring', 'AWS', 'CI/CD', 'Python', 'Terraform'],
  'Product Engineer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Figma', 'Agile', 'Docker'],
};

const SKILL_FOCUS = {
  React: 'Components, hooks, state management, and performance optimization. Build a dashboard app.',
  'Node.js': 'Event loop, Express APIs, middleware, and async patterns. Build a REST API.',
  TypeScript: 'Types, interfaces, generics, and strict mode. Refactor a JS project to TS.',
  AWS: 'EC2, S3, Lambda, and IAM basics. Deploy a full-stack app to AWS.',
  Docker: 'Containers, Dockerfile, Docker Compose. Containerize a Node + MongoDB app.',
  PostgreSQL: 'SQL queries, indexes, joins, and schema design. Design a relational database.',
  'System Design': 'Scalability, load balancing, caching, and database sharding. Design 2 systems on paper.',
  Redis: 'Caching, pub/sub, and session storage. Add Redis caching to an API.',
  'Next.js': 'App Router, SSR, API routes, and deployment. Build a Next.js portfolio site.',
  MongoDB: 'Documents, aggregation, indexing, and Mongoose. Build a CRUD API with MongoDB.',
  Express: 'Routing, middleware, error handling, and validation. Build a production-ready API.',
  Kubernetes: 'Pods, services, deployments, and Helm charts. Deploy an app to a local K8s cluster.',
  Kafka: 'Producers, consumers, and event-driven architecture. Build a message queue demo.',
  GraphQL: 'Schemas, resolvers, and Apollo Server. Replace REST endpoints with GraphQL.',
  Python: 'Core syntax, OOP, and virtual environments. Build a data processing script.',
  Java: 'OOP, collections, streams, and Spring basics. Build a REST API with Spring Boot.',
};

const DEFAULT_SKILLS = TARGET_SKILLS['Full Stack Developer'];

export const getTargetSkillsForRole = (role) => {
  if (!role?.trim()) return DEFAULT_SKILLS;
  return TARGET_SKILLS[role.trim()] || DEFAULT_SKILLS;
};

export const buildCompleteRoadmap = (missingSkills) =>
  missingSkills.map((skill, i) => ({
    week: i + 1,
    skill,
    focus: SKILL_FOCUS[skill] || `Learn ${skill} fundamentals, best practices, and build a hands-on mini project.`,
    resources: [`Official ${skill} documentation`, 'freeCodeCamp or YouTube crash course', 'Build one portfolio project'],
  }));

export const normalizeGrowthPlan = (plan, currentSkills, targetRole) => {
  const targetSkills = getTargetSkillsForRole(targetRole);
  const gap = calculateSkillMatch(currentSkills, targetSkills);
  const missing = plan?.missingSkills?.length ? plan.missingSkills : gap.missing;
  const aiRoadmap = Array.isArray(plan?.roadmap) ? plan.roadmap : [];
  const roadmap =
    aiRoadmap.length >= missing.length
      ? aiRoadmap.map((item, i) => ({
          week: item.week || i + 1,
          skill: item.skill || missing[i],
          focus: item.focus || SKILL_FOCUS[item.skill] || `Master ${item.skill}`,
          resources: item.resources?.length ? item.resources : [`Official ${item.skill} docs`],
        }))
      : buildCompleteRoadmap(missing);

  return {
    marketScore: plan?.marketScore ?? gap.match,
    missingSkills: missing,
    matchedSkills: gap.matched,
    estimatedLearningMonths: plan?.estimatedLearningMonths ?? Math.max(1, Math.ceil(missing.length / 2)),
    salaryIncrease:
      plan?.salaryIncrease ??
      `+${Math.round(missing.length * 1.5)} to +${Math.round(missing.length * 2.5)} LPA`,
    roadmap,
  };
};
