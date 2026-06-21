const HF_API = 'https://router.huggingface.co/v1/chat/completions';

// Parse JSON from AI response
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

const chat = async (userPrompt, systemPrompt, retries = 2) => {
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || 'meta-llama/Llama-3.2-1B-Instruct';

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

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
          max_tokens: 2048,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw new Error(data.error?.message || `API error (${res.status})`);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI model');
      return content;

    } catch (error) {
      if (error.name === 'AbortError' && attempt < retries) continue;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
};

// Extract keywords from job description
export const extractKeywordsFromJD = async (jobDescription) => {
  try {
    // Manual extraction first (more reliable)
    const text = jobDescription.toLowerCase();
    const techKeywords = [
      'react', 'angular', 'vue', 'node.js', 'nodejs', 'python', 'java', 'javascript', 'typescript',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud',
      'spring', 'spring boot', 'django', 'flask', 'express',
      'mongodb', 'postgresql', 'mysql', 'redis', 'sql',
      'rest', 'restful', 'api', 'graphql', 'microservices',
      'ci/cd', 'jenkins', 'github actions', 'gitlab',
      'html', 'css', 'sass', 'tailwind',
      'git', 'agile', 'scrum', 'jira',
      'kafka', 'rabbitmq', 'elasticsearch',
      'linux', 'unix', 'bash',
      'terraform', 'ansible', 'nginx'
    ];

    const foundKeywords = techKeywords.filter(kw => text.includes(kw));

    // Extract years of experience
    const yearsMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
    const experienceYears = yearsMatch ? parseInt(yearsMatch[1]) : 3;

    // Extract title
    const lines = jobDescription.split('\n').filter(l => l.trim());
    const title = lines[0]?.slice(0, 100) || 'Software Developer';

    const manualExtraction = {
      title,
      keywords: [...new Set(foundKeywords)].slice(0, 20),
      experienceYears,
      mustHave: foundKeywords.slice(0, 5),
      niceToHave: foundKeywords.slice(5, 10)
    };

    console.log('Extracted keywords:', manualExtraction.keywords);
    console.log('Experience required:', experienceYears, 'years');

    return manualExtraction;
  } catch (error) {
    console.error('Keyword extraction failed:', error.message);
    return {
      title: 'Software Developer',
      keywords: ['JavaScript', 'React', 'Node.js'],
      experienceYears: 3,
      mustHave: [],
      niceToHave: []
    };
  }
};

// Normalize bullets to ensure they're always string arrays
const normalizeBullets = (bullets) => {
  if (!bullets || !Array.isArray(bullets)) return [];

  return bullets.map(bullet => {
    // If it's already a string, return it
    if (typeof bullet === 'string') return bullet;

    // If it's an object, try to extract a string representation
    if (typeof bullet === 'object') {
      // Check common fields that might contain the bullet text
      return bullet.text || bullet.description || bullet.bullet ||
             bullet.achievement || JSON.stringify(bullet);
    }

    // Convert anything else to string
    return String(bullet);
  }).filter(b => b && b.length > 0);
};

// Manual resume parser - more reliable than AI for small models
const manualParseResume = (resumeText) => {
  const text = resumeText.trim();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  console.log('\n=== RESUME PARSER DEBUG ===');
  console.log('Total lines:', lines.length);
  console.log('First 10 lines:', lines.slice(0, 10));

  // Extract contact info - more comprehensive patterns
  const email = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] || '';

  // Phone patterns: (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890
  const phoneMatch = text.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const phone = phoneMatch?.[0] || '';

  // LinkedIn patterns
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/([\w-]+)|linkedin:?\s*([\w-]+))/i);
  const linkedin = linkedinMatch?.[1] || linkedinMatch?.[2] || '';

  // GitHub patterns
  const githubMatch = text.match(/(?:github\.com\/([\w-]+)|github:?\s*([\w-]+))/i);
  const github = githubMatch?.[1] || githubMatch?.[2] || '';

  // Portfolio/Website patterns
  const portfolioMatch = text.match(/(?:portfolio:?\s*|website:?\s*|blog:?\s*)(https?:\/\/[^\s]+|www\.[^\s]+|[\w-]+\.(?:com|dev|io|net|org))/i);
  const portfolio = portfolioMatch?.[1] || '';

  console.log('Contact info extracted:', { email, phone, linkedin, github, portfolio });

  // Extract name (first non-section line)
  let name = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip if it's a section header (all caps) or contains common header keywords
    if (line.match(/^[A-Z\s]{3,}$/) ||
        line.match(/^(RESUME|CV|CURRICULUM|CONTACT|PROFILE|SUMMARY|EXPERIENCE|EDUCATION|SKILLS)/i)) {
      continue;
    }
    // Skip if it has email or phone (contact line, not name)
    if (line.includes('@') || line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      continue;
    }
    // Take first valid line as name
    if (line.length > 2 && line.length < 60) {
      name = line.replace(/[|•]/g, ' ').trim();
      break;
    }
  }
  if (!name) name = lines[0]?.replace(/[|•]/g, ' ').trim() || 'Resume Owner';

  // Find section indices
  const sections = {
    summary: -1,
    experience: -1,
    skills: -1,
    education: -1
  };

  lines.forEach((line, i) => {
    const upper = line.toUpperCase();
    if (/^(PROFESSIONAL\s+)?SUMMARY|OBJECTIVE|ABOUT|PROFILE/i.test(line)) sections.summary = i;
    if (/^(WORK\s+)?EXPERIENCE|EMPLOYMENT|CAREER|PROFESSIONAL\s+EXPERIENCE/i.test(line)) sections.experience = i;
    if (/^(TECHNICAL\s+)?SKILLS?|TECHNOLOGIES|COMPETENCIES/i.test(line)) sections.skills = i;
    if (/^EDUCATION|ACADEMIC|QUALIFICATIONS/i.test(line)) sections.education = i;
  });

  console.log('Detected sections:', sections);

  // Extract Summary
  let summary = '';
  if (sections.summary !== -1) {
    const nextSection = Math.min(
      ...[sections.experience, sections.skills, sections.education, lines.length]
        .filter(idx => idx > sections.summary)
    );
    summary = lines.slice(sections.summary + 1, nextSection).join(' ').slice(0, 500);
  }

  // Extract Skills
  let skills = [];
  if (sections.skills !== -1) {
    const nextSection = Math.min(
      ...[sections.experience, sections.education, sections.summary, lines.length]
        .filter(idx => idx > sections.skills)
    );
    const skillsLines = lines.slice(sections.skills + 1, Math.min(sections.skills + 15, nextSection));
    const skillsText = skillsLines.join(' ');

    // Try multiple delimiters
    skills = skillsText
      .split(/[,|•·\n\/;]/)
      .map(s => s.replace(/^[-:•\s]+/, '').replace(/[•\s]+$/, '').trim())
      .filter(s => {
        // Filter out invalid entries
        if (!s || s.length < 2 || s.length > 50) return false;
        if (s.match(/^[0-9]+$/)) return false; // Pure numbers
        if (s.match(/^(and|or|with|using|including)$/i)) return false; // Conjunctions
        return true;
      })
      .slice(0, 40);

    console.log('Extracted skills:', skills.length, skills.slice(0, 10));
  }

  // If no skills found in skills section, extract from experience
  if (skills.length === 0) {
    console.log('No skills section found, extracting from text...');
    const commonTechSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
      'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'REST', 'GraphQL', 'Microservices',
      'Linux', 'Bash', 'Terraform', 'Ansible', 'Nginx', 'Apache'
    ];

    const textLower = text.toLowerCase();
    skills = commonTechSkills.filter(skill =>
      textLower.includes(skill.toLowerCase())
    );
    console.log('Auto-detected skills:', skills.length);
  }

  // Extract Experience
  const experience = [];
  if (sections.experience !== -1) {
    const nextSection = Math.min(
      ...[sections.skills, sections.education, sections.summary, lines.length]
        .filter(idx => idx > sections.experience)
    );

    const expLines = lines.slice(sections.experience + 1, nextSection);
    console.log('Experience section lines:', expLines.length);
    console.log('Experience lines sample:', expLines.slice(0, 15));

    let currentExp = null;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const nextLine = expLines[i + 1] || '';

      // Check for job title (contains role keywords)
      const titlePattern = /(software|full.?stack|front.?end|back.?end|web|mobile|developer|engineer|programmer|analyst|manager|intern|consultant|specialist|architect|designer|lead|senior|junior|associate|director|coordinator|administrator|trainee|scientist|devops|sre|qa|tester|scrum|product|data|ml|ai)/i;

      // Check for date pattern - more comprehensive
      const datePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|[0-9]{1,2}\/[0-9]{4}|\d{4})[\s\-–—\/]+(present|current|now|ongoing|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|[0-9]{1,2}\/[0-9]{4})/i;

      // Pattern 1: Company + Date on same line (e.g., "Pure BlocksFeb 2025 – Present")
      // Then next line has title (e.g., "Software DeveloperReactJs...")
      // The key insight: date line should NOT have title keywords, next line SHOULD have them
      const lineHasDate = datePattern.test(line);
      const lineHasTitle = titlePattern.test(line);
      const nextLineHasTitle = titlePattern.test(nextLine);
      const isBullet = !!line.match(/^[•\-\*]/);

      if (lineHasDate && !isBullet && !lineHasTitle && nextLine && nextLineHasTitle) {
        // Save previous experience if exists
        if (currentExp && currentExp.bullets.length > 0) {
          experience.push(currentExp);
          console.log('Saved experience:', currentExp.title, 'with', currentExp.bullets.length, 'bullets');
        }

        // Extract company and date from current line
        const dateMatch = line.match(datePattern);
        const company = dateMatch ? line.substring(0, dateMatch.index).trim() : line.trim();
        const duration = dateMatch ? dateMatch[0] : '';

        // Extract title from next line - get the role keywords
        const titleLine = nextLine;
        const titleMatch = titleLine.match(titlePattern);
        let title = 'Position';

        if (titleMatch) {
          // Find where the title keyword ends (look for capital letter after the keyword as separator)
          const startPos = titleMatch.index;
          const keyword = titleMatch[0];
          const afterKeyword = titleLine.substring(startPos + keyword.length);

          // Extract title: from start of line until we hit capital letter (start of tech stack)
          // e.g., "Software DeveloperReactJs" -> "Software Developer"
          const capitalMatch = afterKeyword.match(/[A-Z]/);
          if (capitalMatch) {
            title = titleLine.substring(0, startPos + keyword.length).trim();
          } else {
            title = titleLine.trim().split(/[,|]/)[0].trim();
          }
        }

        currentExp = {
          title: title,
          company: company,
          location: '',
          duration: duration,
          bullets: []
        };

        console.log('✓ Started new experience (Pattern 1):', { title, company, duration });
        i++; // Skip next line since we already processed it
      }
      // Pattern 2: Title line with dates (e.g., "Software Engineer | Google | 2020-2023")
      else if (lineHasTitle && lineHasDate && !isBullet) {
        if (currentExp && currentExp.bullets.length > 0) {
          experience.push(currentExp);
          console.log('✓ Saved experience:', currentExp.title, 'with', currentExp.bullets.length, 'bullets');
        }

        const parts = line.split(/\s*[\|]\s*/);
        const duration = line.match(datePattern)?.[0] || '';

        currentExp = {
          title: parts[0].trim(),
          company: parts[1]?.trim() || '',
          location: parts[2]?.trim() || '',
          duration: duration,
          bullets: []
        };
        console.log('✓ Started new experience (Pattern 2):', currentExp.title);
      }
      // Pattern 3: "Title at Company" or "Title, Company" (no dates on line)
      else if (lineHasTitle && !isBullet && !lineHasDate && (line.includes(' at ') || line.includes(', '))) {
        if (currentExp && currentExp.bullets.length > 0) {
          experience.push(currentExp);
          console.log('✓ Saved experience:', currentExp.title, 'with', currentExp.bullets.length, 'bullets');
        }

        let title = '', company = '';
        if (line.includes(' at ')) {
          [title, company] = line.split(' at ').map(s => s.trim());
        } else if (line.includes(', ')) {
          const parts = line.split(', ');
          title = parts[0].trim();
          company = parts[1]?.trim() || '';
        }

        currentExp = {
          title,
          company,
          location: '',
          duration: '',
          bullets: []
        };
        console.log('✓ Started new experience (Pattern 3):', currentExp.title);
      }
      // Pattern 4: Title on one line, check if next line is company or date
      else if (lineHasTitle && !isBullet && !lineHasDate && !line.includes(' at ') && nextLine) {
        const nextHasDate = datePattern.test(nextLine);
        const nextIsShort = nextLine.length < 60 && !titlePattern.test(nextLine);

        if (nextIsShort || nextHasDate) {
          if (currentExp && currentExp.bullets.length > 0) {
            experience.push(currentExp);
            console.log('✓ Saved experience:', currentExp.title, 'with', currentExp.bullets.length, 'bullets');
          }

          const title = line.trim();
          const companyLine = nextLine.trim();
          const duration = companyLine.match(datePattern)?.[0] || '';
          const company = duration ? companyLine.replace(datePattern, '').trim() : companyLine;

          currentExp = {
            title,
            company,
            location: '',
            duration,
            bullets: []
          };
          console.log('✓ Started new experience (Pattern 4):', currentExp.title);
          i++; // Skip next line since we used it
        }
      }
      // Bullet point
      else if (isBullet) {
        if (currentExp) {
          const bullet = line.replace(/^[•\-\*]\s*/, '').trim();
          if (bullet) {
            currentExp.bullets.push(bullet);
          }
        }
      }
    }

    // Don't forget the last experience
    if (currentExp && currentExp.bullets.length > 0) {
      experience.push(currentExp);
      console.log('Saved final experience:', currentExp.title, 'with', currentExp.bullets.length, 'bullets');
    }

    console.log('Total experiences extracted:', experience.length);
  } else {
    console.log('No EXPERIENCE section found in resume');
  }

  // Extract Education
  const education = [];
  if (sections.education !== -1) {
    const nextSection = Math.min(
      ...[sections.experience, sections.skills, sections.summary, lines.length]
        .filter(idx => idx > sections.education)
    );

    const eduLines = lines.slice(sections.education + 1, Math.min(sections.education + 20, nextSection));
    let currentEdu = null;

    console.log('Education section lines:', eduLines.length);

    eduLines.forEach((line, idx) => {
      // Expanded degree patterns
      const degreePattern = /bachelor|master|undergraduate|graduate|b\.?s\.?c?\.?|m\.?s\.?c?\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|b\.?a\.?|m\.?a\.?|ph\.?d|doctorate|associate|diploma|degree|bca|mca|be|me|btech|mtech/i;
      const year = line.match(/\b(19|20)\d{2}\b/)?.[0];
      const yearRange = line.match(/\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}\b/)?.[0];

      // Pattern 1: Line contains degree keyword
      if (degreePattern.test(line)) {
        if (currentEdu) education.push(currentEdu);
        currentEdu = {
          degree: line.replace(/\b(19|20)\d{2}\b/g, '').trim(), // Remove year from degree
          institution: '',
          year: yearRange || year || ''
        };
      }
      // Pattern 2: Institution line (follows degree, doesn't have degree keywords)
      else if (currentEdu && !currentEdu.institution && line.length > 3 && !degreePattern.test(line)) {
        // Check if this line looks like an institution (university, college, institute, school)
        const isInstitution = /university|college|institute|school|academy|polytechnic/i.test(line) ||
                             (line.length > 10 && line.length < 100 && !line.match(/^[0-9]+$/));

        if (isInstitution) {
          currentEdu.institution = line.replace(/\b(19|20)\d{2}\b/g, '').trim();
          currentEdu.year = currentEdu.year || yearRange || year || '';
        }
      }
      // Pattern 3: Standalone year line
      else if (currentEdu && !currentEdu.year && (yearRange || year)) {
        currentEdu.year = yearRange || year;
      }
    });

    if (currentEdu) education.push(currentEdu);
    console.log('Extracted education:', education.length);
  }

  return {
    contact: {
      name,
      email,
      phone,
      linkedin: linkedin ? `linkedin.com/in/${linkedin}` : '',
      github: github ? `github.com/${github}` : '',
      portfolio
    },
    summary: summary || text.split('\n\n')[0]?.slice(0, 300) || '',
    experience: experience.slice(0, 10),
    skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'],
    education: education.slice(0, 5)
  };
};

// Parse resume text into structured data
export const parseResumeText = async (resumeText) => {
  try {
    // ALWAYS use manual parsing - it's most reliable
    const manualParsed = manualParseResume(resumeText);

    console.log('Manual parsing results:', {
      name: manualParsed.contact.name,
      email: manualParsed.contact.email,
      experienceCount: manualParsed.experience.length,
      skillsCount: manualParsed.skills.length,
      educationCount: manualParsed.education.length,
      summaryLength: manualParsed.summary.length
    });

    // Log experience details
    manualParsed.experience.forEach((exp, i) => {
      console.log(`Experience ${i + 1}:`, {
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        bulletCount: exp.bullets.length
      });
    });

    return manualParsed;
  } catch (error) {
    console.error('Resume parsing failed:', error.message);
    // Return basic fallback
    return {
      contact: {
        name: 'Resume Owner',
        email: resumeText.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: resumeText.split('\n\n')[0]?.slice(0, 300) || '',
      experience: [],
      skills: ['JavaScript', 'React', 'Node.js'],
      education: []
    };
  }
};

// Optimize resume bullets with keywords
export const optimizeBullets = async (bullets, keywords, role) => {
  try {
    // Ensure bullets is a valid array of strings
    const normalizedBullets = normalizeBullets(bullets);
    if (normalizedBullets.length === 0) return [];

    const keywordList = keywords.slice(0, 8).join(', ');

    // Try AI optimization first
    try {
      const prompt = `Add keywords to these bullets naturally. Return ONLY JSON array of strings.

Keywords: ${keywordList}

Original:
${normalizedBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return format: ["bullet 1 with keywords", "bullet 2 with keywords"]`;

      const content = await chat(prompt, 'Return ONLY JSON array of strings.');
      const parsed = parseJSON(content);

      let result = Array.isArray(parsed) ? parsed : parsed.bullets || [];
      result = normalizeBullets(result);

      // Validate - check if result contains original content
      const hasOriginalContent = result.some(r =>
        normalizedBullets.some(orig => {
          const origWords = orig.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const resultWords = r.toLowerCase().split(/\s+/);
          const overlap = origWords.filter(w => resultWords.includes(w)).length;
          return overlap >= Math.min(3, origWords.length / 2);
        })
      );

      if (result.length === normalizedBullets.length && hasOriginalContent) {
        console.log('AI optimization successful');
        return result;
      }
    } catch (aiError) {
      console.error('AI bullet optimization failed:', aiError.message);
    }

    // Fallback: Manual keyword injection
    console.log('Using manual keyword injection');
    const keywordsToAdd = keywords.slice(0, 5);
    return normalizedBullets.map((bullet, i) => {
      const keyword = keywordsToAdd[i % keywordsToAdd.length];
      if (!bullet.toLowerCase().includes(keyword.toLowerCase())) {
        return `${bullet.replace(/\.$/, '')} using ${keyword}`;
      }
      return bullet;
    });
  } catch (error) {
    console.error('Bullet optimization failed:', error.message);
    return normalizeBullets(bullets);
  }
};

// Generate optimized summary with keywords
export const generateOptimizedSummary = async (originalSummary, keywords, role, experience) => {
  try {
    const keywordList = keywords.slice(0, 8).join(', ');
    const prompt = `Write a professional resume summary that includes these keywords naturally.

Target Role: ${role}
Experience: ${experience} years
Keywords: ${keywordList}
Original: ${originalSummary}

Write a 2-3 sentence summary that highlights expertise in these technologies. Return ONLY the summary text, no JSON.`;

    const content = await chat(
      prompt,
      'You write professional resume summaries. Return ONLY the summary text.'
    );
    return content.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error('Summary generation failed:', error.message);
    return originalSummary || `Experienced ${role} with ${experience}+ years of expertise in ${keywords.slice(0, 5).join(', ')}.`;
  }
};

// Calculate ATS score
export const calculateATSScore = (resume, keywords) => {
  const resumeText = JSON.stringify(resume).toLowerCase();
  let score = 50; // Base score

  // Keyword matching (40 points)
  const matchedKeywords = keywords.filter(keyword =>
    resumeText.includes(keyword.toLowerCase())
  );
  score += (matchedKeywords.length / keywords.length) * 40;

  // Has contact info (5 points)
  if (resume.contact?.email) score += 2;
  if (resume.contact?.phone) score += 2;
  if (resume.contact?.linkedin || resume.contact?.github) score += 1;

  // Has quantified achievements (5 points)
  const experienceText = JSON.stringify(resume.experience);
  const hasMetrics = /\d+%|\d+\+|\d+ years?|\d+K\+|\d+M\+/i.test(experienceText);
  if (hasMetrics) score += 5;

  return Math.min(Math.round(score), 100);
};

// Main optimization function
export const optimizeResume = async (resumeText, jobDescription) => {
  try {
    console.log('\n=== Starting Resume Optimization ===');
    console.log('Resume text length:', resumeText.length);
    console.log('Job description length:', jobDescription.length);

    // Step 1: Extract keywords from JD
    console.log('\n[Step 1] Extracting keywords from job description...');
    const jdData = await extractKeywordsFromJD(jobDescription);
    const keywords = jdData.keywords || [];
    console.log('Target role:', jdData.title);
    console.log('Keywords extracted:', keywords.length);

    // Step 2: Parse original resume
    console.log('\n[Step 2] Parsing resume...');
    const parsedResume = await parseResumeText(resumeText);
    console.log('Parsed resume structure:', {
      hasContact: !!parsedResume.contact,
      hasSummary: !!parsedResume.summary,
      experienceCount: parsedResume.experience?.length || 0,
      skillsCount: parsedResume.skills?.length || 0,
      educationCount: parsedResume.education?.length || 0
    });

    // Step 3: Calculate original ATS score
    const atsScoreBefore = calculateATSScore(parsedResume, keywords);
    console.log('ATS score before:', atsScoreBefore);

    // Step 4: Optimize summary (skip AI, use manual)
    console.log('\n[Step 4] Optimizing summary...');
    let optimizedSummary = parsedResume.summary;
    if (keywords.length > 0) {
      const topKeywords = keywords.slice(0, 5).join(', ');
      if (!optimizedSummary.toLowerCase().includes(keywords[0].toLowerCase())) {
        optimizedSummary = `${parsedResume.summary} Proficient in ${topKeywords}.`;
      }
    }

    // Step 5: Optimize experience bullets
    console.log('\n[Step 5] Optimizing experience bullets...');
    const optimizedExperience = await Promise.all(
      parsedResume.experience.map(async (exp, idx) => {
        console.log(`  Processing experience ${idx + 1}/${parsedResume.experience.length}`);
        if (exp.bullets && exp.bullets.length > 0) {
          const optimizedBullets = await optimizeBullets(exp.bullets, keywords, jdData.title);
          console.log(`    Original bullets: ${exp.bullets.length}, Optimized: ${optimizedBullets.length}`);
          return { ...exp, bullets: optimizedBullets };
        }
        return exp;
      })
    );

    // Step 6: Add missing keywords to skills
    console.log('\n[Step 6] Adding missing keywords to skills...');
    const existingSkills = new Set(parsedResume.skills.map(s => s.toLowerCase()));
    const addedKeywords = keywords.filter(k => !existingSkills.has(k.toLowerCase())).slice(0, 10);
    const optimizedSkills = [...parsedResume.skills, ...addedKeywords];
    console.log('Skills before:', parsedResume.skills.length, 'After:', optimizedSkills.length);
    console.log('Added keywords:', addedKeywords);

    // Step 7: Build optimized resume - PRESERVE ALL DATA
    const optimizedResume = {
      contact: parsedResume.contact, // Preserve contact info
      summary: optimizedSummary,
      experience: optimizedExperience,
      skills: optimizedSkills,
      education: parsedResume.education, // Preserve education
      certifications: parsedResume.certifications || [] // Preserve certifications
    };

    // Step 8: Calculate new ATS score
    const atsScoreAfter = calculateATSScore(optimizedResume, keywords);
    console.log('\nATS score after:', atsScoreAfter, '(change:', atsScoreAfter - atsScoreBefore, ')');

    // Step 9: Generate improvements list
    const improvements = [
      addedKeywords.length > 0 ? `Added ${addedKeywords.length} missing keywords: ${addedKeywords.slice(0, 5).join(', ')}${addedKeywords.length > 5 ? '...' : ''}` : null,
      atsScoreAfter > atsScoreBefore ? `ATS score improved from ${atsScoreBefore} → ${atsScoreAfter}` : null,
      optimizedSummary !== parsedResume.summary ? 'Optimized professional summary with target keywords' : null,
      'Enhanced experience bullets with relevant keywords',
    ].filter(Boolean);

    console.log('Improvements:', improvements);
    console.log('=== Optimization Complete ===\n');

    return {
      optimizedResume,
      extractedKeywords: keywords,
      addedKeywords,
      atsScoreBefore,
      atsScoreAfter,
      improvements,
      targetRole: jdData.title,
    };
  } catch (error) {
    console.error('Resume optimization error:', error);
    throw new Error('Failed to optimize resume: ' + error.message);
  }
};
