export const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'GraphQL', 'REST API', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SASS',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Kafka', 'RabbitMQ', 'Microservices', 'System Design', 'Machine Learning', 'TensorFlow', 'PyTorch',
  'Git', 'Linux', 'Nginx', 'Webpack', 'Vite', 'Jest', 'Cypress', 'Playwright',
  'Agile', 'Scrum', 'JIRA', 'Figma', 'Webpack', 'Babel', 'Prisma', 'TypeORM', 'Sequelize',
  'Socket.io', 'WebSockets', 'OAuth', 'JWT', 'gRPC', 'Apache', 'Spark', 'Hadoop',
  'Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'TDD', 'SOLID',
];

const skillMap = new Map(
  TECH_SKILLS.flatMap((skill) => {
    const normalized = skill.toLowerCase().replace(/[.\s]/g, '');
    return [[normalized, skill]];
  })
);

const aliases = {
  js: 'JavaScript',
  ts: 'TypeScript',
  node: 'Node.js',
  nodejs: 'Node.js',
  reactjs: 'React',
  react: 'React',
  nextjs: 'Next.js',
  vuejs: 'Vue',
  angularjs: 'Angular',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  k8s: 'Kubernetes',
  gcp: 'GCP',
  amazonwebservices: 'AWS',
  amazon: 'AWS',
  expressjs: 'Express',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
};

export const normalizeSkill = (skill) => {
  const key = skill.toLowerCase().replace(/[.\s]/g, '');
  return aliases[key] || skillMap.get(key) || skill.trim();
};

export const extractSkillsFromText = (text) => {
  const found = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of TECH_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\./g, '\\.?')}\\b`, 'i');
    if (pattern.test(lowerText)) found.add(skill);
  }

  for (const [alias, canonical] of Object.entries(aliases)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(lowerText)) found.add(canonical);
  }

  return [...found];
};

export const calculateSkillMatch = (resumeSkills, jdSkills) => {
  const resumeSet = new Set(resumeSkills.map((s) => normalizeSkill(s).toLowerCase()));
  const jdSet = jdSkills.map((s) => normalizeSkill(s));
  const matched = jdSet.filter((s) => resumeSet.has(s.toLowerCase()));
  const missing = jdSet.filter((s) => !resumeSet.has(s.toLowerCase()));
  const match = jdSet.length ? Math.round((matched.length / jdSet.length) * 100) : 0;
  return { match, matched, missing };
};
