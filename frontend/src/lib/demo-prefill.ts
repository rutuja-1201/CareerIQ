import { JOB_ROLES } from "@/lib/job-roles";

export const DEMO_CAREER_GOAL =
  "I want to become a Senior Full Stack Engineer in 12 months.";

export const DEMO_GITHUB_USERNAME = "octocat";

export const DEMO_TARGET_ROLE =
  JOB_ROLES.find((r) => r.includes("Full Stack")) ?? JOB_ROLES[0];

export const DEMO_SALARY_LPA = "6";
