const GITHUB_API = 'https://api.github.com';

const FRAMEWORK_SIGNALS = [
  { match: ['react', 'reactjs'], skill: 'React' },
  { match: ['next.js', 'nextjs'], skill: 'Next.js' },
  { match: ['vue', 'vuejs'], skill: 'Vue' },
  { match: ['angular'], skill: 'Angular' },
  { match: ['node', 'nodejs', 'node.js'], skill: 'Node.js' },
  { match: ['express'], skill: 'Express' },
  { match: ['nestjs'], skill: 'NestJS' },
  { match: ['django'], skill: 'Django' },
  { match: ['flask'], skill: 'Flask' },
  { match: ['fastapi'], skill: 'FastAPI' },
  { match: ['spring'], skill: 'Spring Boot' },
  { match: ['mongodb', 'mongo'], skill: 'MongoDB' },
  { match: ['postgres', 'postgresql'], skill: 'PostgreSQL' },
  { match: ['mysql'], skill: 'MySQL' },
  { match: ['redis'], skill: 'Redis' },
  { match: ['docker'], skill: 'Docker' },
  { match: ['kubernetes', 'k8s'], skill: 'Kubernetes' },
  { match: ['terraform'], skill: 'Terraform' },
  { match: ['aws'], skill: 'AWS' },
  { match: ['gcp', 'google cloud'], skill: 'GCP' },
  { match: ['azure'], skill: 'Azure' },
  { match: ['graphql'], skill: 'GraphQL' },
  { match: ['typescript'], skill: 'TypeScript' },
  { match: ['tailwind'], skill: 'Tailwind CSS' },
  { match: ['prisma'], skill: 'Prisma' },
  { match: ['kafka'], skill: 'Kafka' },
  { match: ['ci/cd', 'github actions', 'jenkins'], skill: 'CI/CD' },
];

const fetchJSON = async (url) => {
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
};

const detectFromText = (text, found) => {
  const lower = text.toLowerCase();
  FRAMEWORK_SIGNALS.forEach(({ match, skill }) => {
    if (match.some((m) => lower.includes(m))) found.add(skill);
  });
};

export const analyzeGithubProfile = async (username) => {
  const [user, repos] = await Promise.all([
    fetchJSON(`${GITHUB_API}/users/${username}`),
    fetchJSON(`${GITHUB_API}/users/${username}/repos?sort=updated&per_page=30`),
  ]);

  const languages = {};
  const frameworks = new Set();
  const topics = new Set();
  let totalStars = 0;
  let recentCommits = 0;

  const topRepos = repos.slice(0, 12).map((repo) => {
    totalStars += repo.stargazers_count || 0;
    if (repo.language) languages[repo.language] = (languages[repo.language] || 0) + 1;
    if (repo.pushed_at) {
      const daysSince = (Date.now() - new Date(repo.pushed_at).getTime()) / (24 * 60 * 60 * 1000);
      if (daysSince < 90) recentCommits += 1;
    }
    (repo.topics || []).forEach((t) => {
      topics.add(t);
      detectFromText(t, frameworks);
    });
    detectFromText(`${repo.name} ${repo.description || ''}`, frameworks);
    return {
      name: repo.name,
      stars: repo.stargazers_count || 0,
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
      updatedAt: repo.pushed_at,
    };
  });

  const languageList = Object.entries(languages)
    .map(([name, count]) => ({ name, bytes: count }))
    .sort((a, b) => b.bytes - a.bytes);

  languageList.slice(0, 6).forEach((l) => frameworks.add(l.name));

  const extractedSkills = [...frameworks].sort();
  const totalRepos = user.public_repos || repos.length;
  const accountAge = user.created_at
    ? (Date.now() - new Date(user.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    : 1;

  const commitEstimate = Math.min(totalRepos * 15 + recentCommits * 5, 500);
  const starScore = Math.min(totalStars * 2, 30);
  const repoScore = Math.min(totalRepos * 3, 25);
  const activityScore = Math.min(accountAge * 5 + recentCommits * 2, 25);
  const languageScore = Math.min(languageList.length * 5, 20);

  const developerScore = Math.min(100, Math.round(starScore + repoScore + activityScore + languageScore));

  return {
    username,
    developerScore,
    strengths: extractedSkills.slice(0, 8),
    languages: languageList,
    frameworks: extractedSkills,
    topics: [...topics].slice(0, 12),
    totalRepos,
    totalStars,
    totalCommits: commitEstimate,
    recentActivity: recentCommits,
    topRepos: topRepos.sort((a, b) => b.stars - a.stars).slice(0, 5),
    profileUrl: user.html_url,
    bio: user.bio || '',
  };
};
