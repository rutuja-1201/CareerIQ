export const JOB_ROLES = [
  "Senior Full Stack Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Node.js Developer",
  "Java Developer",
  "Python Developer",
  "Mobile Developer (React Native)",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "QA / Test Engineer",
  "Technical Lead",
  "Software Architect",
  "Site Reliability Engineer (SRE)",
  "Product Engineer",
] as const;

export const CUSTOM_ROLE = "__custom__";

export type JobRole = (typeof JOB_ROLES)[number];

export const resolveRole = (preset: string, custom: string) =>
  preset === CUSTOM_ROLE ? custom.trim() : preset;

export const TARGET_SKILLS: Record<string, string[]> = {
  "Senior Full Stack Developer": ["React", "Node.js", "TypeScript", "AWS", "Docker", "PostgreSQL", "System Design", "Redis"],
  "Full Stack Developer": ["React", "Node.js", "JavaScript", "MongoDB", "Express", "REST API", "Git", "Docker"],
  "Frontend Developer": ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Jest", "HTML", "CSS"],
  "Backend Developer": ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kafka", "System Design"],
  "React Developer": ["React", "Next.js", "TypeScript", "Redux", "Jest", "Tailwind CSS", "REST API", "Git"],
  "Node.js Developer": ["Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "Docker", "REST API", "JWT"],
  "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Jenkins", "Monitoring"],
};

export const getRoleSkillsText = (role: string) => {
  const skills = TARGET_SKILLS[role] || TARGET_SKILLS["Full Stack Developer"];
  return `${role}\nRequired skills: ${skills.join(", ")}`;
};
