const HF_API = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/Llama-3.2-1B-Instruct';

const getConfig = () => {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error('HF_TOKEN is not configured');
  return {
    token,
    model: process.env.HF_MODEL || DEFAULT_MODEL,
  };
};

// Fallback responses when AI fails (demo safety net)
const FALLBACKS = {
  resumeAnalysis: {
    atsScore: 75,
    resumeQuality: 'Good',
    missingKeywords: ['Docker', 'Kubernetes', 'AWS'],
    strengths: ['Strong technical skills', 'Clear project descriptions'],
    weakBullets: [
      { before: 'Developed web applications', after: 'Architected and deployed scalable web applications serving 10K+ users, improving performance by 40%' }
    ],
    feedback: 'Your resume demonstrates solid technical foundation. Consider adding cloud and DevOps skills for senior roles.'
  },
  careerTwinReply: "I'm analyzing your career goal right now. Based on typical patterns for this role, you'll need to focus on strengthening your technical skills and gaining experience with modern tools. Let's create a focused learning plan to get you there!",
  learningRoadmap: [
    { week: 1, skill: 'Docker', focus: 'Container fundamentals and Dockerfile creation', resources: ['Docker official docs', 'Docker Mastery course'] },
    { week: 2, skill: 'Kubernetes', focus: 'K8s basics and deployment', resources: ['Kubernetes.io tutorials'] },
    { week: 3, skill: 'AWS', focus: 'Cloud services (EC2, S3, Lambda)', resources: ['AWS Getting Started'] },
    { week: 4, skill: 'System Design', focus: 'Scalability patterns', resources: ['System Design Primer'] }
  ]
};

const parseJSON = (text) => {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    throw new Error('Failed to parse AI response');
  }
};

const chat = async (userPrompt, systemPrompt = 'You are a helpful assistant. Respond with ONLY valid JSON, no markdown.', retries = 2) => {
  const { token, model } = getConfig();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(HF_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1024,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle rate limiting with backoff
        if (res.status === 429 && attempt < retries) {
          console.warn(`Rate limited, retrying in ${(attempt + 1) * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        const msg = data.error?.message || data.message || `Hugging Face API error (${res.status})`;
        throw new Error(msg);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Hugging Face model');
      return content;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout, retrying...');
        if (attempt < retries) continue;
        throw new Error('Hugging Face API request timeout after multiple attempts');
      }
      if (attempt < retries) {
        console.warn(`Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
};

export const analyzeResumeWithAI = async (resumeText, jdText = '') => {
  try {
    const prompt = `Analyze this resume${jdText ? ' against the job description' : ''}.

Resume:
${resumeText.slice(0, 6000)}

${jdText ? `Job Description:\n${jdText.slice(0, 3000)}` : ''}

Return ONLY valid JSON:
{
  "atsScore": 82,
  "resumeQuality": "Good",
  "missingKeywords": ["AWS", "Kafka"],
  "strengths": ["React", "NodeJS"],
  "weakBullets": [
    { "before": "Built APIs", "after": "Developed 15+ REST APIs serving 10,000+ requests/day using Node.js and Express." }
  ],
  "feedback": "2-3 sentence actionable feedback"
}`;

    return parseJSON(await chat(prompt, 'You are an expert ATS resume analyzer. Return ONLY valid JSON.'));
  } catch (error) {
    console.error('AI resume analysis failed, using fallback:', error.message);
    return FALLBACKS.resumeAnalysis;
  }
};

export const extractJDSkillsWithAI = async (jdText) => {
  const prompt = `Extract technical skills and experience from this job description.

${jdText.slice(0, 5000)}

Return ONLY valid JSON:
{
  "title": "React Developer",
  "skills": ["React", "AWS", "Docker"],
  "experienceRequired": 3
}`;

  return parseJSON(await chat(prompt, 'Extract job requirements. Return ONLY valid JSON.'));
};

export const optimizeResumeBullet = async (bullet) => {
  const prompt = `Rewrite this resume bullet to be more impactful with action verbs and metrics.

Original: "${bullet}"

Return ONLY valid JSON:
{
  "optimized": "Developed reusable React components that reduced development effort by 30%."
}`;

  return parseJSON(await chat(prompt, 'You rewrite resume bullets. Return ONLY valid JSON.'));
};

export const generateInterviewQuestions = async (resumeText, experience, jdText) => {
  const prompt = `Generate interview questions.

Experience: ${experience} years
Resume: ${resumeText.slice(0, 3000)}
Job Description: ${jdText.slice(0, 2000)}

Return ONLY valid JSON with exactly 5 questions per category:
{
  "frontend": ["q1", "q2", "q3", "q4", "q5"],
  "backend": ["q1", "q2", "q3", "q4", "q5"],
  "systemDesign": ["q1", "q2", "q3", "q4", "q5"],
  "behavioral": ["q1", "q2", "q3", "q4", "q5"]
}`;

  return parseJSON(await chat(prompt, 'You generate technical interview questions. Return ONLY valid JSON.'));
};

export const generateLearningRoadmap = async (missingSkills) => {
  if (!missingSkills.length) return [];

  try {
    const prompt = `Create a 4-week learning roadmap for: ${missingSkills.join(', ')}

Return ONLY valid JSON with one roadmap entry per missing skill (${missingSkills.length} weeks total):
[
  { "week": 1, "skill": "Docker", "focus": "Detailed weekly plan", "resources": ["Docker docs", "freeCodeCamp"] }
]`;

    const parsed = parseJSON(await chat(prompt, 'You create learning roadmaps. Return ONLY valid JSON array.'));
    return Array.isArray(parsed) ? parsed : parsed.roadmap || [];
  } catch (error) {
    console.error('AI roadmap generation failed, using fallback:', error.message);
    // Generate basic roadmap from missing skills
    return missingSkills.slice(0, 8).map((skill, idx) => ({
      week: idx + 1,
      skill,
      focus: `Master ${skill} fundamentals and practical application`,
      resources: [`${skill} official documentation`, `${skill} tutorial on freeCodeCamp`]
    }));
  }
};

export const generateCareerGrowthPlan = async (currentSkills, targetRole) => {
  const prompt = `Career coach for software engineers.

Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}

Return ONLY valid JSON with roadmap covering ALL missing skills (one week per skill):
{
  "marketScore": 72,
  "missingSkills": ["Docker", "AWS"],
  "estimatedLearningMonths": 4,
  "salaryIncrease": "+5 to +8 LPA",
  "roadmap": [
    { "week": 1, "skill": "Docker", "focus": "Learn containers this week", "resources": ["Docker docs"] }
  ]
}`;

  return parseJSON(await chat(prompt, 'You are a career coach. Return ONLY valid JSON.'));
};

export const parseCareerGoalWithAI = async (message) => {
  const prompt = `Parse this developer career goal into structured data.

Goal: "${message}"

Pick targetRole from this list (exact match):
${[
  'Senior Full Stack Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Technical Lead',
  'Software Architect',
].join(', ')}

Map "Senior Full Stack Engineer" to "Senior Full Stack Developer".

Return ONLY valid JSON:
{
  "targetRole": "Senior Full Stack Developer",
  "timelineMonths": 12,
  "summary": "Become a Senior Full Stack Developer in 12 months"
}`;

  return parseJSON(await chat(prompt, 'You parse career goals. Return ONLY valid JSON.'));
};

export const generateCareerTwinReply = async ({
  message,
  targetRole,
  currentReadiness,
  expectedReadiness,
  missingSkills,
  estimatedTimelineMonths,
  timelineMonthsRequested,
  currentSkills,
}) => {
  try {
    const prompt = `You are Career Twin AI — a warm, expert career coach for software developers.

User said: "${message}"

Their profile skills: ${currentSkills.slice(0, 15).join(', ') || 'not yet scanned'}
Target: ${targetRole}
Current readiness: ${currentReadiness}%
Expected readiness after upskilling: ${expectedReadiness}%
Missing skills: ${missingSkills.join(', ')}
Estimated time to job-ready: ${estimatedTimelineMonths} months (user asked for ${timelineMonthsRequested} months)

Write a 3-4 sentence personalized response. Be specific, encouraging, and actionable. Mention readiness %, top missing skills, and timeline. Do NOT use JSON or bullet lists — plain conversational text only.`;

    const content = await chat(
      prompt,
      'You are Career Twin AI, a supportive developer career coach. Reply in plain text only, no JSON.'
    );
    return content.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('AI Career Twin reply failed, using fallback:', error.message);
    // Generate a personalized fallback message
    const timelineAdjustment = estimatedTimelineMonths !== timelineMonthsRequested
      ? ` I've adjusted your ${timelineMonthsRequested}-month timeline to a more realistic ${estimatedTimelineMonths} months.`
      : '';
    return `Great goal! You're currently ${currentReadiness}% ready for ${targetRole}. You're missing ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? ', and more' : ''}.${timelineAdjustment} Follow the learning roadmap I've created, and you'll be interview-ready soon!`;
  }
};

export const generateInterviewPreview = async (context, skills, targetRole) => {
  const prompt = `Generate interview prep for a ${targetRole} candidate.

Skills: ${skills.slice(0, 20).join(', ')}
Context: ${context.slice(0, 1500)}

Return ONLY valid JSON with exactly 3 questions per category:
{
  "technical": ["Explain Event Loop", "q2", "q3"],
  "hr": ["Tell me about yourself", "q2", "q3"],
  "projectBased": ["How did you scale MongoDB?", "q2", "q3"],
  "architecture": ["Design Next.js + Node.js + MongoDB system", "q2", "q3"]
}`;

  return parseJSON(await chat(prompt, 'You generate interview questions. Return ONLY valid JSON.'));
};
