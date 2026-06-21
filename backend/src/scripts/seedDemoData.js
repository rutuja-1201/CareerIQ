import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import CareerTwin from '../models/CareerTwin.js';
import GithubReport from '../models/GithubReport.js';
import CareerGrowth from '../models/CareerGrowth.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import ResumeBuilder from '../models/ResumeBuilder.js';

const DEMO_EMAIL = 'demo@careeriq.dev';
const DEMO_PASSWORD = 'Demo@123';

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo user data
    const existingUser = await User.findOne({ email: DEMO_EMAIL });
    if (existingUser) {
      console.log('🗑️  Clearing existing demo user data...');
      await Resume.deleteMany({ userId: existingUser._id });
      await CareerTwin.deleteMany({ userId: existingUser._id });
      await GithubReport.deleteMany({ userId: existingUser._id });
      await CareerGrowth.deleteMany({ userId: existingUser._id });
      await SkillAnalysis.deleteMany({ userId: existingUser._id });
      await InterviewQuestion.deleteMany({ userId: existingUser._id });
      await ResumeBuilder.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const demoUser = await User.create({
      name: 'Alex Developer',
      email: DEMO_EMAIL,
      password: hashedPassword,
      experience: 2,
      skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Git', 'TypeScript', 'MongoDB'],
      currentSalary: '8 LPA',
      githubUrl: 'https://github.com/alexdev',
      linkedinUrl: 'https://linkedin.com/in/alexdev',
    });
    console.log(`✅ Demo user created: ${demoUser.email}`);

    // Create Resume data
    console.log('📄 Creating resume data...');
    const resume = await Resume.create({
      userId: demoUser._id,
      fileName: 'Alex_Developer_Resume.pdf',
      extractedText: 'Full Stack Developer with 2 years of experience...',
      skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'HTML', 'CSS', 'Git', 'TypeScript', 'REST APIs'],
      atsScore: 78,
      missingKeywords: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'System Design'],
      strengths: ['Strong frontend skills', 'MERN stack proficiency', 'Version control expertise'],
      feedback: 'Your resume shows solid technical skills but lacks cloud and DevOps keywords that are common in senior roles. Consider adding specific metrics and project outcomes.',
      resumeQuality: 'B+',
      weakBullets: [
        {
          before: 'Worked on e-commerce website using React and Node.js',
          after: 'Architected and deployed a scalable e-commerce platform using React and Node.js, reducing page load time by 40% and increasing conversion rate by 15% through optimized API design and lazy loading strategies'
        },
        {
          before: 'Developed REST APIs for mobile app',
          after: 'Designed and implemented 15+ RESTful API endpoints serving 10K+ daily active users, improving response time by 60% through database query optimization and Redis caching layer'
        }
      ]
    });
    console.log('✅ Resume created');

    // Create Career Twin conversation
    console.log('🤖 Creating Career Twin conversation...');
    const careerTwin = await CareerTwin.create({
      userId: demoUser._id,
      userMessage: 'I want to become a Senior Full Stack Engineer in 12 months',
      interpretedGoal: 'Transition to Senior Full Stack Engineer role within 12 months',
      targetRole: 'Senior Full Stack Engineer',
      timelineMonthsRequested: 12,
      estimatedTimelineMonths: 5,
      currentReadiness: 68,
      expectedReadiness: 92,
      missingSkills: ['Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD'],
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'],
      weeklyLearningPlan: [
        { week: 1, skill: 'Docker', focus: 'Containerization basics', resources: ['Docker official tutorial', 'Docker Mastery course'] },
        { week: 2, skill: 'Docker', focus: 'Docker Compose & multi-container apps', resources: ['Docker Compose docs', 'Build with Docker'] },
        { week: 3, skill: 'Docker', focus: 'Dockerfile optimization', resources: ['Dockerfile best practices'] },
        { week: 4, skill: 'Docker', focus: 'Docker networking & volumes', resources: ['Docker networking guide'] },
        { week: 5, skill: 'Kubernetes', focus: 'K8s fundamentals', resources: ['Kubernetes.io tutorials', 'K8s the hard way'] },
        { week: 6, skill: 'Kubernetes', focus: 'Pods, Services, Deployments', resources: ['K8s official docs'] },
        { week: 7, skill: 'Kubernetes', focus: 'ConfigMaps, Secrets, Storage', resources: ['K8s storage guide'] },
        { week: 8, skill: 'Kubernetes', focus: 'Helm charts', resources: ['Helm documentation'] },
        { week: 9, skill: 'AWS', focus: 'AWS fundamentals (EC2, S3)', resources: ['AWS Getting Started', 'A Cloud Guru'] },
        { week: 10, skill: 'AWS', focus: 'RDS, Lambda, API Gateway', resources: ['AWS Serverless guide'] },
        { week: 11, skill: 'AWS', focus: 'ECS, ECR for container deployment', resources: ['AWS ECS workshop'] },
        { week: 12, skill: 'AWS', focus: 'CloudWatch, IAM, Security', resources: ['AWS Security best practices'] },
        { week: 13, skill: 'System Design', focus: 'Scalability patterns', resources: ['System Design Primer', 'Designing Data-Intensive Applications'] },
        { week: 14, skill: 'System Design', focus: 'Database scaling', resources: ['Database internals book'] },
        { week: 15, skill: 'System Design', focus: 'Caching strategies', resources: ['Redis documentation'] },
        { week: 16, skill: 'System Design', focus: 'Microservices architecture', resources: ['Microservices patterns'] },
        { week: 17, skill: 'CI/CD', focus: 'GitHub Actions basics', resources: ['GitHub Actions docs', 'CI/CD pipeline guide'] },
        { week: 18, skill: 'CI/CD', focus: 'Testing automation', resources: ['Jest, Cypress guides'] },
        { week: 19, skill: 'CI/CD', focus: 'Deployment strategies', resources: ['Blue-green deployment', 'Canary releases'] },
        { week: 20, skill: 'Integration', focus: 'Build capstone project with all skills', resources: ['Deploy full-stack app with K8s + AWS'] },
      ],
      twinReply: "Great ambition, Alex! Based on your current MERN stack skills, you're 68% ready for a Senior Full Stack role. You're missing Docker, Kubernetes, AWS, System Design, and CI/CD - critical for senior positions. I've adjusted your timeline to a realistic 5 months (20 weeks) with a focused learning plan. Start with containerization (Docker), move to orchestration (K8s), then cloud (AWS), followed by system design thinking, and finally CI/CD automation. Build a capstone project in the final month to demonstrate all skills together. You'll be interview-ready for senior roles by month 5!"
    });
    console.log('✅ Career Twin created');

    // Create GitHub Report
    console.log('🐙 Creating GitHub report...');
    const githubReport = await GithubReport.create({
      userId: demoUser._id,
      username: 'alexdev',
      developerScore: 82,
      strengths: ['Consistent commit history', 'Full-stack project portfolio', 'Active open source contributor'],
      frameworks: ['React', 'Express', 'Next.js', 'Tailwind CSS'],
      topics: ['web-development', 'full-stack', 'javascript', 'react', 'nodejs', 'mongodb'],
      languages: [
        { name: 'JavaScript', bytes: 156789 },
        { name: 'TypeScript', bytes: 89234 },
        { name: 'HTML', bytes: 45123 },
        { name: 'CSS', bytes: 32456 }
      ],
      recentActivity: 245,
      totalRepos: 18,
      totalStars: 127,
      totalCommits: 892,
      topRepos: [
        { name: 'ecommerce-mern-stack', stars: 45, language: 'JavaScript' },
        { name: 'task-manager-app', stars: 32, language: 'TypeScript' },
        { name: 'portfolio-website', stars: 28, language: 'JavaScript' }
      ]
    });
    console.log('✅ GitHub report created');

    // Create Career Growth simulation
    console.log('📈 Creating career growth data...');
    const careerGrowth = await CareerGrowth.create({
      userId: demoUser._id,
      currentSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'HTML', 'CSS', 'Git', 'REST APIs'],
      targetRole: 'Senior Full Stack Engineer',
      currentSalaryLpa: 8,
      marketScore: 72,
      expectedReadiness: 92,
      potentialSalaryRange: '12-18 LPA',
      missingSkills: ['Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD'],
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'],
      estimatedLearningMonths: 5,
      salaryIncrease: '50-125%',
      roadmap: [
        { week: 1, skill: 'Docker', focus: 'Container fundamentals', resources: ['Docker docs', 'Docker Mastery'] },
        { week: 5, skill: 'Kubernetes', focus: 'K8s orchestration', resources: ['K8s tutorials'] },
        { week: 9, skill: 'AWS', focus: 'Cloud services', resources: ['AWS training'] },
        { week: 13, skill: 'System Design', focus: 'Scalability patterns', resources: ['System Design Primer'] },
        { week: 17, skill: 'CI/CD', focus: 'Automation pipelines', resources: ['GitHub Actions guide'] }
      ]
    });
    console.log('✅ Career growth created');

    // Create Skill Analysis
    console.log('🎯 Creating skill analysis...');
    const skillAnalysis = await SkillAnalysis.create({
      userId: demoUser._id,
      resumeId: resume._id,
      resumeSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'HTML', 'CSS', 'Git', 'REST APIs'],
      jdSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD', 'MongoDB', 'TypeScript', 'Microservices', 'REST APIs', 'GraphQL', 'Redis'],
      match: 72,
      missing: ['Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD', 'Microservices', 'GraphQL', 'Redis'],
      matched: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'REST APIs'],
      learningRoadmap: [
        { week: 1, skill: 'Docker', focus: 'Containerization', resources: ['Docker tutorial'] },
        { week: 4, skill: 'Kubernetes', focus: 'K8s basics', resources: ['K8s docs'] },
        { week: 8, skill: 'AWS', focus: 'Cloud deployment', resources: ['AWS guide'] },
        { week: 12, skill: 'GraphQL', focus: 'API design', resources: ['GraphQL tutorial'] }
      ]
    });
    console.log('✅ Skill analysis created');

    // Create Interview Questions
    console.log('💬 Creating interview questions...');
    await InterviewQuestion.create({
      userId: demoUser._id,
      targetRole: 'Senior Full Stack Engineer',
      questions: [
        {
          category: 'technical',
          question: 'Explain the difference between horizontal and vertical scaling. When would you use each?',
          difficulty: 'medium'
        },
        {
          category: 'technical',
          question: 'How would you design a rate limiter for an API that handles 1 million requests per day?',
          difficulty: 'hard'
        },
        {
          category: 'technical',
          question: 'What is the difference between REST and GraphQL? What are the trade-offs?',
          difficulty: 'medium'
        },
        {
          category: 'behavioral',
          question: 'Tell me about a time when you had to make a difficult technical decision with limited information.',
          difficulty: 'medium'
        },
        {
          category: 'behavioral',
          question: 'How do you handle code review feedback that you disagree with?',
          difficulty: 'easy'
        },
        {
          category: 'project',
          question: 'Walk me through your most complex project. What were the technical challenges and how did you solve them?',
          difficulty: 'medium'
        },
        {
          category: 'architecture',
          question: 'Design a URL shortener service like bit.ly. Consider scalability, reliability, and performance.',
          difficulty: 'hard'
        },
        {
          category: 'architecture',
          question: 'How would you implement authentication and authorization in a microservices architecture?',
          difficulty: 'hard'
        }
      ]
    });
    console.log('✅ Interview questions created');

    // Create Resume Builder data
    console.log('📝 Creating resume builder data...');
    await ResumeBuilder.create({
      userId: demoUser._id,
      originalResume: `Alex Developer
alex@email.com | 123-456-7890

EXPERIENCE
Software Developer | Tech Startup
Built web applications with React and Node.js`,
      jobDescription: `Senior Full Stack Developer

We're looking for an experienced engineer with:
• 5+ years React, Node.js experience
• Strong Docker, Kubernetes skills
• AWS cloud expertise
• System design knowledge
• CI/CD pipeline experience`,
      targetRole: 'Senior Full Stack Developer',
      optimizedResume: {
        contact: {
          name: 'Alex Developer',
          email: 'alex@email.com',
          phone: '123-456-7890',
          linkedin: 'linkedin.com/in/alexdev',
          github: 'github.com/alexdev'
        },
        summary: 'Results-driven Full Stack Developer with 2+ years of experience building scalable web applications using React, Node.js, and modern cloud technologies. Proven track record in architecting robust solutions with Docker, AWS, and implementing CI/CD pipelines to streamline development workflows.',
        experience: [
          {
            title: 'Software Developer',
            company: 'Tech Startup',
            location: 'Remote',
            duration: '2022 - Present',
            bullets: [
              'Architected and deployed 10+ scalable web applications using React and Node.js, serving 50K+ monthly active users with 99.9% uptime',
              'Implemented Docker containerization and Kubernetes orchestration, reducing deployment time by 60% and improving system reliability',
              'Designed and integrated AWS cloud infrastructure (EC2, S3, Lambda, RDS) reducing operational costs by 40%',
              'Established CI/CD pipelines using GitHub Actions and Jenkins, automating testing and deployment for 15+ microservices',
              'Led system design initiatives for high-traffic applications, implementing caching strategies and load balancing to handle 1M+ requests/day'
            ]
          }
        ],
        skills: [
          'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'HTML', 'CSS', 'Git',
          'Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD', 'Jenkins', 'GitHub Actions',
          'Microservices', 'REST APIs', 'Redis'
        ],
        education: [
          {
            degree: 'B.S. Computer Science',
            institution: 'University',
            year: '2022'
          }
        ]
      },
      extractedKeywords: ['React', 'Node.js', 'Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD', 'Microservices'],
      addedKeywords: ['Docker', 'Kubernetes', 'AWS', 'System Design', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Microservices'],
      atsScoreBefore: 62,
      atsScoreAfter: 92,
      improvements: [
        'Added 8 missing keywords: Docker, Kubernetes, AWS, System Design, CI/CD, Jenkins, GitHub Actions, Microservices',
        'ATS score improved from 62 → 92',
        'Optimized professional summary with target keywords',
        'Rewritten experience bullets with quantified achievements and metrics'
      ],
      pdfGenerated: false
    });
    console.log('✅ Resume builder data created');

    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('\n📋 Demo Account Credentials:');
    console.log(`Email: ${DEMO_EMAIL}`);
    console.log(`Password: ${DEMO_PASSWORD}`);
    console.log('\n💡 Use these credentials to login and see pre-populated data');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

seedDemoData();
