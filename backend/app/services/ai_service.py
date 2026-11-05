import json
import re
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Predefined common technical skills for deterministic local parsing fallback
KNOWN_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express", "FastAPI",
    "Django", "Flask", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD",
    "HTML", "CSS", "Tailwind CSS", "Next.js", "Vue", "Angular", "GraphQL",
    "REST API", "Linux", "Java", "C++", "C#", "Go", "Rust", "Pandas",
    "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "Machine Learning", "System Design"
]

def _clean_json_text(text: str) -> str:
    """Strip markdown code fence blocks if returned by model."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def parse_resume_with_ai(raw_text: str) -> Dict[str, Any]:
    """
    Parses resume text using Gemini AI if configured, or deterministic local analyzer if unavailable.
    """
    if not raw_text or len(raw_text.strip()) == 0:
        return _fallback_resume_analysis("", is_empty=True)

    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            prompt = f"""
You are an expert technical recruiter and resume analyzer.
Analyze the following resume text and extract candidate information in STRICT JSON format.
Do NOT hallucinate or invent qualifications not present in the document.

Respond ONLY with valid JSON conforming to this schema:
{{
  "candidate_name": "string or null",
  "professional_summary": "string or null",
  "technical_skills": ["list", "of", "technical", "skills"],
  "soft_skills": ["list", "of", "soft", "skills"],
  "education": [
    {{
      "institution": "string",
      "degree": "string",
      "year": "string or null"
    }}
  ],
  "experience_projects": [
    {{
      "title": "string",
      "organization": "string or null",
      "description": "string"
    }}
  ],
  "strengths": ["bullet point strengths evidenced in resume"],
  "missing_sections": ["list any missing essential sections like Projects, Experience, Skills, Education"],
  "improvement_suggestions": ["actionable advice to improve resume impact and ATS readability"]
}}

Resume text:
\"\"\"
{raw_text[:8000]}
\"\"\"
"""
            response = client.models.generate_content(
                model=settings.AI_MODEL,
                contents=prompt
            )
            cleaned = _clean_json_text(response.text)
            data = json.loads(cleaned)
            data["is_ai_generated"] = True
            return data
        except Exception as e:
            logger.warning(f"AI resume parsing failed or timed out: {e}. Falling back to deterministic local parsing.")

    # Deterministic local fallback
    return _fallback_resume_analysis(raw_text)


def _fallback_resume_analysis(raw_text: str, is_empty: bool = False) -> Dict[str, Any]:
    """
    Deterministic rule-based resume extraction when live AI is unavailable.
    """
    if is_empty:
        return {
            "candidate_name": None,
            "professional_summary": "No readable text could be extracted from this document (image or scanned PDF).",
            "technical_skills": [],
            "soft_skills": [],
            "education": [],
            "experience_projects": [],
            "strengths": [],
            "missing_sections": ["Text Content (Document is scanned/empty)"],
            "improvement_suggestions": [
                "Upload a text-based searchable PDF rather than a scanned image.",
                "Ensure your PDF has selectable text."
            ],
            "is_ai_generated": False
        }

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    candidate_name = lines[0] if lines else "Applicant"
    # Filter candidate name if first line is just "Resume" or "Curriculum Vitae"
    if candidate_name.lower() in ["resume", "curriculum vitae", "cv"] and len(lines) > 1:
        candidate_name = lines[1]

    # Keyword matching for technical skills
    found_tech = []
    text_lower = raw_text.lower()
    for skill in KNOWN_TECH_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_tech.append(skill)

    # Soft skills search
    known_soft = ["Communication", "Teamwork", "Problem Solving", "Leadership", "Adaptability", "Collaboration", "Critical Thinking"]
    found_soft = [s for s in known_soft if re.search(r'\b' + re.escape(s.lower()) + r'\b', text_lower)]

    # Check for essential sections
    missing_sections = []
    if "education" not in text_lower:
        missing_sections.append("Education Section")
    if "project" not in text_lower:
        missing_sections.append("Projects Section")
    if "experience" not in text_lower and "work" not in text_lower:
        missing_sections.append("Work Experience Section")
    if "skill" not in text_lower:
        missing_sections.append("Technical Skills Section")

    # Suggestions
    suggestions = [
        "Include measurable outcomes and metrics in your project bullet points (e.g., 'improved performance by 30%').",
        "Place your strongest technical skills at the top under a clear Technical Skills header.",
        "Ensure consistent date formatting across your education and project experiences."
    ]
    if missing_sections:
        suggestions.insert(0, f"Add the following missing resume sections: {', '.join(missing_sections)}.")

    return {
        "candidate_name": candidate_name[:100],
        "professional_summary": lines[1] if len(lines) > 1 and len(lines[1]) > 20 else "Technical candidate profile extracted deterministically.",
        "technical_skills": found_tech,
        "soft_skills": found_soft,
        "education": [{"degree": "Extracted Degree / Coursework", "institution": "Found in Resume", "year": None}] if "education" in text_lower else [],
        "experience_projects": [{"title": "Extracted Technical Project", "description": "Details extracted from resume"}] if "project" in text_lower else [],
        "strengths": [f"Demonstrated proficiency in {len(found_tech)} cataloged technical skills.", "Structured resume format."],
        "missing_sections": missing_sections,
        "improvement_suggestions": suggestions,
        "is_ai_generated": False
    }


def extract_job_requirements_with_ai(raw_text: str, title: Optional[str] = None, company: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts structured requirements from job descriptions using Gemini AI or deterministic fallback.
    """
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""
You are an expert technical recruiter analyzing a job posting.
Extract key requirements into STRICT JSON format.
Schema:
{{
  "required_skills": ["essential technical skills and languages"],
  "preferred_skills": ["nice-to-have skills"],
  "tools_frameworks": ["libraries, platforms, cloud, CI/CD, tools"],
  "experience_expectations": "short summary of expected experience or seniority",
  "education_requirements": "short summary of degree or equivalent experience",
  "responsibilities": ["key responsibilities listed"],
  "teamwork_communication": ["collaboration and soft skills mentioned"]
}}

Job Posting:
\"\"\"
{raw_text[:8000]}
\"\"\"
"""
            response = client.models.generate_content(
                model=settings.AI_MODEL,
                contents=prompt
            )
            cleaned = _clean_json_text(response.text)
            data = json.loads(cleaned)
            return data
        except Exception as e:
            logger.warning(f"AI job requirement extraction failed: {e}. Using deterministic local extraction.")

    # Deterministic local fallback
    return _fallback_job_extraction(raw_text)


def _fallback_job_extraction(raw_text: str) -> Dict[str, Any]:
    text_lower = raw_text.lower()
    found_tech = []
    for skill in KNOWN_TECH_SKILLS:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found_tech.append(skill)

    # Split into required vs preferred heuristics
    req_skills = found_tech[:max(1, int(len(found_tech) * 0.7))]
    pref_skills = found_tech[max(1, int(len(found_tech) * 0.7)):]

    tools = [s for s in found_tech if s in ["Docker", "Kubernetes", "AWS", "Git", "GitHub", "CI/CD", "Linux", "Redis"]]

    return {
        "required_skills": req_skills if req_skills else ["Problem Solving", "Software Development Fundamentals"],
        "preferred_skills": pref_skills,
        "tools_frameworks": tools,
        "experience_expectations": "0-2 years of relevant software engineering or project experience.",
        "education_requirements": "B.S. / B.E. in Computer Science or related STEM field, or equivalent practical experience.",
        "responsibilities": [
            "Design, implement, and maintain scalable web features.",
            "Collaborate with engineering teams on code reviews and feature releases.",
            "Write clean, testable, and maintainable code."
        ],
        "teamwork_communication": [
            "Clear verbal and written communication.",
            "Collaborative problem solving and team orientation."
        ]
    }
