# SkillForge AI

> **Tagline:** Forge Your Skills. Build Your Future.

SkillForge AI is an AI-powered Career Intelligence and Skill Development Platform designed for students and early-career developers. It bridges the gap between academic learning and real-world hiring standards through automated resume intelligence, target job parsing, transparent skill-gap benchmarking, and personalized daily learning roadmaps.

---

## 🌟 Core Features

1. **Authentication & Identity Security:**
   - JWT-based authentication with bcrypt-hashed passwords.
   - User registration, login, and secure session management.

2. **Career Profile & Target Goal Setting:**
   - Academic background tracking (College, Degree, Branch, Graduation Year, CGPA).
   - Technical skills cataloging with verified proficiency levels.
   - Primary career goal targeting (Role, Domain, Company Type, Target Timeline).

3. **PDF Resume Parsing & Intelligence:**
   - PDF upload with size, MIME type, and path traversal security.
   - Automated text extraction using `pypdf`.
   - AI/Rule-based structured analysis: detected technical skills, soft skills, strengths, missing sections, and ATS readability suggestions.

4. **Target Job Parsing:**
   - Direct extraction of essential technical requirements, nice-to-have tools, responsibilities, and seniority expectations from raw job postings.

5. **Transparent Skill-Gap Benchmarking:**
   - Heuristic skill matching with alias canonicalization (e.g., `React.js` -> `React`, `py` -> `Python`).
   - Weighted match score calculation (70% required skills, 30% preferred skills).
   - Instant visual identification of matched vs. missing critical competencies.

6. **Interactive Learning Roadmap & Habit Tracker:**
   - Personalized multi-week curriculum broken down into actionable daily study milestones.
   - Authoritative official documentation and tutorial links for every recommended topic.
   - Interactive task completion tracking with persistent progress calculation.

7. **Unified Career Intelligence Dashboard:**
   - Authentic aggregated overview (`/dashboard/summary`) displaying resume status, job match score, active roadmap progress, and recommended next action.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:**
  - React 19 + TypeScript + Vite
  - Tailwind CSS + Lucide React Icons
  - React Router DOM + Axios
- **Backend:**
  - Python 3.12+ / FastAPI
  - SQLAlchemy ORM + SQLite (local development) / PostgreSQL (production)
  - Pydantic v2 + Pydantic Settings
  - Passlib + Bcrypt + PyJWT
  - PyPDF + Google Gemini API (with deterministic offline fallback)
  - Pytest (34 passing tests with 100% test coverage across all features)

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations / startup server (creates SQLite database & seeds initial skills automatically)
uvicorn app.main:app --reload --port 8000
```
Backend API interactive docs will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be live at: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
pytest tests/
```
Runs all 34 automated tests covering Auth, Career Profile, Skills, Goals, Resumes, Jobs, Skill Gap Analysis, Roadmaps, and Dashboard metrics.

### Frontend Production Build
```bash
cd frontend
npm run build
```
Type-checks TypeScript and compiles production bundles with Vite.

---

## ☁️ Deployment Guide (Vercel)

SkillForge AI frontend is optimized for zero-config deployment on Vercel:

1. Push your repository to your GitHub account:
   ```bash
   git add .
   git commit -m "feat: complete SkillForge AI platform with full feature suite"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin master
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, configure:
   - `VITE_API_BASE_URL`: The URL of your deployed backend API (or local `http://localhost:8000/api/v1`).
6. Click **Deploy**. Vercel will build the frontend and serve it globally with full SPA routing support (`vercel.json`).
