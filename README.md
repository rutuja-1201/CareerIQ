# CareerIQ

**AI-Powered Developer Career Intelligence Platform**

Built by **Team Bytebrains**

CareerIQ is a full-stack Career Operating System for developers. It combines resume intelligence, GitHub skill extraction, job-market gap analysis, AI learning roadmaps, salary simulation, interview preparation, and an AI Resume Builder — all powered by Hugging Face AI, Next.js, Node.js, and MongoDB.

> **From 40 hours of career research → 2 minutes of clarity.**

---

## Table of Contents

- [About Team Bytebrains](#about-team-bytebrains)
- [The Problem We Solve](#the-problem-we-solve)
- [What CareerIQ Does](#what-careeriq-does)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Demo Account & Seed Data](#demo-account--seed-data)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [Hackathon Demo Flow](#hackathon-demo-flow)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## About Team Bytebrains

**Bytebrains** is the team behind CareerIQ — a group of developers building AI-native tools that help software engineers understand where they stand, what they are missing, and how to reach their next career milestone.

CareerIQ reflects Bytebrains' core belief: developers deserve one unified platform for career intelligence, not scattered tools for resumes, GitHub, salaries, and interview prep.

---

## The Problem We Solve

**73% of developers don't know what skills they need for their next career move.**

Developers typically spend 40+ hours across:
- Resume optimization and ATS checkers
- Manual GitHub portfolio review
- Browsing dozens of job postings for skill requirements
- Learning path research (YouTube, blogs, Reddit)
- Salary comparison across Glassdoor, Levels.fyi, Blind
- Interview prep across LeetCode, system design, and HR questions

**Result:** Career paralysis, missed opportunities, and undervalued talent.

**CareerIQ compresses this into a single AI-powered workflow.**

---

## What CareerIQ Does

| Input | CareerIQ Output |
|-------|-----------------|
| Natural language goal (*"I want to become a Senior Full Stack Engineer in 12 months"*) | Readiness %, missing skills, timeline, weekly learning plan |
| Resume PDF + GitHub username + target role | Full intelligence report: ATS score, skills, gap analysis, salary projection, interview questions |
| Resume text + job description | ATS-optimized resume, keyword injection, PDF download |
| GitHub profile | Languages, frameworks, commit activity, developer score |
| Current skills vs target role | Match %, missing skills, week-by-week roadmap |

---

## Core Features

### 1. Career Twin AI (`/career-twin`) — Flagship Feature

Conversational career coaching in plain English. Tell CareerIQ your goal and get:
- Parsed target role and timeline
- Current readiness percentage
- Missing skills list
- Realistic timeline estimate
- AI-generated weekly learning plan

**API:** `POST /api/career-twin/chat`

---

### 2. Career Intelligence Scan (`/intelligence`)

One unified scan combining:
- Resume ATS analysis and bullet upgrades
- GitHub skill extraction
- Skill gap vs target role
- Learning roadmap
- Salary simulation
- Interview question generation

**API:** `POST /api/intelligence/scan`

---

### 3. AI Resume Builder (`/resume-builder`)

Optimize any resume for a specific job description:
- AI keyword injection from the JD
- ATS score improvement (e.g. 62 → 92)
- Bullet rewriting with metrics
- **Edit modal** — adjust fonts, spacing, text with live PDF preview
- **Preview & Download PDF**

**APIs:**
- `POST /api/resume-builder/optimize`
- `POST /api/resume-builder/preview-pdf`
- `PATCH /api/resume-builder/:id`
- `GET /api/resume-builder/generate-pdf/:id`

---

### 4. Resume Intelligence (`/resume`)

Upload a PDF resume and get:
- ATS score and quality rating
- Missing keywords
- Strengths and extracted skills
- AI bullet upgrade suggestions (before → after)

---

### 5. GitHub Skill Extraction (`/github`)

Analyze a GitHub profile for:
- Languages and frameworks used
- Repository topics and activity
- Developer score and strengths

---

### 6. Skill Gap Analysis (`/skill-gap`)

Compare your skills against a target role or saved job description:
- Match percentage
- Matched vs missing skills
- Week-by-week learning roadmap

---

### 7. Career Growth Simulator (`/career-growth`)

Simulate career progression with:
- Market readiness score
- Expected readiness over time
- Salary range projection (LPA)

---

### 8. Interview Preparation (`/interviews`)

AI-generated interview questions tailored to your resume and target role:
- Technical (frontend/backend)
- System design
- Behavioral / HR

---

### 9. Additional Tools

| Route | Feature |
|-------|---------|
| `/dashboard` | Career analytics, charts, recent activity |
| `/job-description` | Parse and save job descriptions |
| `/resume-bullets` | AI bullet point optimizer |
| `/salary` | Salary prediction by experience and skills |
| `/applications` | Job application tracker (Kanban-style) |
| `/profile` | User profile and skills management |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, React Query, Recharts, Radix UI, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT auth, Express Validator, Multer |
| **Database** | MongoDB with Mongoose |
| **AI** | Hugging Face Inference API — Llama 3.2 1B Instruct |
| **PDF** | Puppeteer (server-side resume PDF generation) |
| **DevOps** | Docker, Docker Compose |

### Hybrid Intelligence Model

```
Algorithmic Layer          AI Layer (Hugging Face)
─────────────────          ───────────────────────
ATS scoring                Resume feedback & bullets
Skill matching             Learning roadmaps
Salary rules               Interview questions
Keyword extraction         Career Twin coaching
                           Resume optimization
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Next.js Frontend (port 3000)                │
│   App Router · React Query · Tailwind · Auth Context     │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JWT)
┌──────────────────────────▼──────────────────────────────┐
│              Express Backend (port 5001)                 │
│   Routes · Middleware · Rate Limiting · File Upload      │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
┌──────────▼──────────┐         ┌──────────▼──────────────┐
│   MongoDB Atlas /   │         │  Hugging Face Router    │
│   Local MongoDB     │         │  Llama 3.2 1B Instruct  │
└─────────────────────┘         └─────────────────────────┘
```

---

## Project Structure

```
CareerIQ/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── career-twin/     # Career Twin AI
│   │   │   ├── intelligence/    # Unified career scan
│   │   │   ├── resume-builder/  # AI Resume Builder
│   │   │   ├── dashboard/       # Analytics dashboard
│   │   │   └── ...              # Other feature pages
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Sidebar, dashboard layout
│   │   │   ├── ui/              # Button, Card, Select, Input
│   │   │   └── resume-builder/  # Resume editor modal
│   │   └── lib/                 # API client, auth, utils
│   └── .env.example
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Business logic & AI calls
│   │   ├── models/              # Mongoose schemas
│   │   ├── middleware/          # Auth, upload, rate limiting
│   │   └── scripts/             # seedDemoData.js
│   └── .env.example
│
├── docker-compose.yml           # Full stack with MongoDB
├── HACKATHON_DEMO.md            # 2-minute judge demo script
└── README.md
```

---

## Prerequisites

Before starting, make sure you have:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 22+ | Required for frontend and backend |
| **npm** | 10+ | Comes with Node.js |
| **MongoDB** | 7+ | Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier |
| **Hugging Face Token** | — | [Create one here](https://huggingface.co/settings/tokens) with **Inference Providers** permission |
| **Git** | — | To clone the repository |

**Optional:**
- Docker & Docker Compose (for containerized setup)
- Google OAuth credentials (for Google sign-in)

---

## Getting Started

Follow these steps to run CareerIQ locally.

### Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd "CareerIQ – AI-Powered Developer Career Intelligence Platform"
```

### Step 2 — Set up MongoDB

**Option A: Local MongoDB**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Or run manually
mongod --dbpath /usr/local/var/mongodb
```

**Option B: MongoDB Atlas**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Copy your connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/careeriq`)

### Step 3 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/careeriq
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
HF_TOKEN=hf_your_huggingface_token_here
HF_MODEL=meta-llama/Llama-3.2-1B-Instruct
FRONTEND_URL=http://localhost:3000
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

You should see:
```
CareerIQ API running on port 5001
```

Verify the API is healthy:
```bash
curl http://localhost:5001/api/health
# {"status":"ok","service":"CareerIQ API","team":"Bytebrains"}
```

### Step 4 — Configure the frontend

Open a **new terminal**:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Step 5 — Create an account or use demo data

**Option A: Register a new account**
1. Go to http://localhost:3000/register
2. Create your account
3. Start with **Career Twin AI** at `/career-twin`

**Option B: Use the pre-seeded demo account (recommended for demos)**

```bash
cd backend
npm run seed:demo
```

| Field | Value |
|-------|-------|
| Email | `demo@careeriq.dev` |
| Password | `Demo@123` |

Login at http://localhost:3000/login — all demo data (scans, GitHub report, dashboard charts) will be pre-loaded.

### Step 6 — Verify everything works

1. Login with demo account
2. Visit `/career-twin` — run a demo goal
3. Visit `/intelligence` — click **Fill demo values** → **Run Career Intelligence Scan**
4. Visit `/resume-builder` — click **Fill Demo Data** → **Optimize Resume with AI**
5. Visit `/dashboard` — confirm charts and metrics load

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: `5001`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: `24h`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: `7d`) |
| `HF_TOKEN` | Yes | Hugging Face API token |
| `HF_MODEL` | No | AI model (default: `meta-llama/Llama-3.2-1B-Instruct`) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:5001/api`) |

---

## Running with Docker

Run the full stack (frontend + backend + MongoDB) with one command:

```bash
# Set your Hugging Face token
export HF_TOKEN=hf_your_token_here

# Build and start all services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| MongoDB | localhost:27017 |

To stop:
```bash
docker compose down
```

To seed demo data inside Docker, run against the Docker MongoDB:
```bash
cd backend
MONGODB_URI=mongodb://localhost:27017/careeriq npm run seed:demo
```

---

## Demo Account & Seed Data

The seed script populates a full demo environment for presentations:

```bash
cd backend
npm run seed:demo
```

**What gets seeded:**
- Demo user profile with skills and GitHub/LinkedIn URLs
- Resume intelligence scan results
- Career Twin conversation history
- GitHub analysis report
- Career growth simulation
- Skill gap analysis
- Interview questions
- Resume builder optimization result
- Dashboard chart data

**Demo credentials:**

```
Email:    demo@careeriq.dev
Password: Demo@123
```

---

## Application Routes

| Route | Feature | Team Bytebrains Highlight |
|-------|---------|---------------------------|
| `/` | Landing page | Product overview |
| `/login` | Authentication | JWT + refresh tokens |
| `/register` | Sign up | — |
| `/career-twin` | Career Twin AI | ⭐ Conversational coaching |
| `/intelligence` | Unified career scan | ⭐ One-scan full report |
| `/resume-builder` | AI Resume Builder | ⭐ JD optimization + PDF |
| `/dashboard` | Analytics dashboard | Career trajectory charts |
| `/resume` | Resume intelligence | ATS scoring |
| `/github` | GitHub analysis | Skill extraction |
| `/skill-gap` | Skill gap engine | Match % + roadmap |
| `/career-growth` | Growth simulator | Salary projection |
| `/interviews` | Interview prep | AI question bank |
| `/job-description` | JD parser | Skill extraction |
| `/resume-bullets` | Bullet optimizer | Before → after rewrites |
| `/salary` | Salary predictor | LPA by skills |
| `/applications` | Application tracker | Status Kanban |
| `/profile` | User profile | Skills & links |

---

## API Reference

Base URL: `http://localhost:5001/api`

All protected routes require: `Authorization: Bearer <access_token>`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, get JWT tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### Core AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/career-twin/chat` | Career Twin AI — natural language goal |
| POST | `/intelligence/scan` | Full career scan (resume + GitHub + role) |
| POST | `/resume-builder/optimize` | Optimize resume for a job description |
| POST | `/resume-builder/preview-pdf` | Live PDF preview (editor) |
| PATCH | `/resume-builder/:id` | Save resume edits and style |
| GET | `/resume-builder/generate-pdf/:id` | Download optimized resume PDF |
| GET | `/resume-builder/history` | Resume builder history |

### Intelligence Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resumes/upload` | Upload resume PDF for analysis |
| GET | `/resumes` | List uploaded resumes |
| POST | `/github/analyze` | Analyze GitHub profile |
| POST | `/skill-gap/analyze` | Skill gap + learning roadmap |
| POST | `/career-growth/simulate` | Career growth + salary simulation |
| POST | `/interviews/generate` | Generate interview questions |
| POST | `/resume-bullets/optimize` | Optimize resume bullet points |
| POST | `/salary/predict` | Salary prediction |
| GET | `/dashboard` | Dashboard analytics data |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

---

## Hackathon Demo Flow

For a judge-ready 2-minute demo, see **[HACKATHON_DEMO.md](./HACKATHON_DEMO.md)**.

**Quick demo path:**

```
Login (demo@careeriq.dev)
  → /career-twin       (30 sec)  Natural language career goal
  → /intelligence      (25 sec)  Full career scan
  → /resume-builder    (25 sec)  Resume optimization + PDF
  → /dashboard         (15 sec)  Analytics overview
```

**Opening pitch (Team Bytebrains):**

> *"73% of developers don't know what skills they need for their next role. CareerIQ by Bytebrains compresses 40 hours of career research into 2 minutes — tell Career Twin AI your goal, run one intelligence scan, and get your readiness score, missing skills, learning roadmap, and an ATS-optimized resume."*

---

## Troubleshooting

### Port 5001 already in use

```bash
# Find and kill the process using port 5001
lsof -i :5001
kill <PID>

# Or use a different port in backend/.env
PORT=5002
# Then update frontend/.env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

### MongoDB connection failed

- Ensure MongoDB is running: `brew services list` or check Atlas IP whitelist
- Verify `MONGODB_URI` in `backend/.env`
- For Atlas: allow `0.0.0.0/0` in Network Access for development

### AI features not working (HF_TOKEN errors)

- Get a token at https://huggingface.co/settings/tokens
- Enable **Inference Providers** permission
- Add to `backend/.env` as `HF_TOKEN=hf_...`
- Restart the backend after updating `.env`

### Frontend can't reach the API

- Confirm backend is running: `curl http://localhost:5001/api/health`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### PDF generation fails

- Puppeteer requires Chromium — on Linux servers install dependencies:
  ```bash
  apt-get install -y chromium-browser
  ```
- Ensure resume optimization completed before downloading PDF

### Build errors

```bash
# Frontend
cd frontend && npm install && npm run build

# Backend (no build step — runs directly)
cd backend && npm install && npm run dev
```

---

## Production Scripts

```bash
# Backend — production
cd backend && npm start

# Frontend — production build
cd frontend && npm run build && npm start
```

---

## Resume Line (for your CV)

> Built **CareerIQ** (Team **Bytebrains**), an AI Career Operating System for developers featuring **Career Twin AI** conversational coaching, unified resume & GitHub intelligence scan, AI Resume Builder with PDF generation, skill-gap analysis, learning roadmaps, salary simulation, and interview preparation — using Hugging Face AI, Next.js, Node.js, MongoDB, and Docker.

---

## License

MIT — Built with care by **Team Bytebrains**.
