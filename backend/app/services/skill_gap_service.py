from typing import List, Dict, Any, Tuple
import re

# Comprehensive canonical skill aliases dictionary
SKILL_ALIASES = {
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express",
    "expressjs": "Express",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "es6": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "docker": "Docker",
    "container": "Docker",
    "containers": "Docker",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "git": "Git",
    "github": "GitHub",
    "next": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue",
    "vuejs": "Vue",
    "angular": "Angular",
    "graphql": "GraphQL",
    "rest": "REST API",
    "restful": "REST API",
    "rest api": "REST API",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "linux": "Linux",
    "sql": "SQL"
}

def normalize_skill(skill_name: str) -> str:
    """
    Normalizes a skill string to its canonical name using alias mapping and title casing.
    """
    if not skill_name:
        return ""
    cleaned = skill_name.strip().lower()
    if cleaned in SKILL_ALIASES:
        return SKILL_ALIASES[cleaned]
    return skill_name.strip().title()


def calculate_skill_gap(
    candidate_skills: List[str],
    job_required_skills: List[str],
    job_preferred_skills: List[str]
) -> Dict[str, Any]:
    """
    Calculates a transparent, deterministic skill gap analysis with normalized aliases.
    
    Match Score Algorithm:
    - Required skills carry 70% weight.
    - Preferred / Nice-to-have skills carry 30% weight.
    - If no preferred skills are listed in the job posting, required skills carry 100% weight.
    Formula:
    match_score = round( (matched_req / total_req)*req_weight + (matched_pref / total_pref)*pref_weight, 1 )
    """
    # Normalize candidate skills
    norm_candidate = set(normalize_skill(s) for s in candidate_skills if s and s.strip())

    # Normalize job skills
    norm_required = [normalize_skill(s) for s in job_required_skills if s and s.strip()]
    norm_preferred = [normalize_skill(s) for s in job_preferred_skills if s and s.strip()]

    # Deduplicate while preserving order
    unique_required = []
    for s in norm_required:
        if s not in unique_required:
            unique_required.append(s)

    unique_preferred = []
    for s in norm_preferred:
        if s not in unique_preferred and s not in unique_required:
            unique_preferred.append(s)

    matched_required = [s for s in unique_required if s in norm_candidate]
    missing_required = [s for s in unique_required if s not in norm_candidate]

    matched_preferred = [s for s in unique_preferred if s in norm_candidate]
    missing_preferred = [s for s in unique_preferred if s not in norm_candidate]

    matched_skills = matched_required + matched_preferred
    missing_skills = missing_required + missing_preferred

    # Calculate transparent score
    total_req_count = len(unique_required)
    total_pref_count = len(unique_preferred)

    if total_req_count == 0 and total_pref_count == 0:
        score = 100.0
    elif total_pref_count == 0:
        score = round((len(matched_required) / total_req_count) * 100.0, 1)
    elif total_req_count == 0:
        score = round((len(matched_preferred) / total_pref_count) * 100.0, 1)
    else:
        req_contrib = (len(matched_required) / total_req_count) * 70.0
        pref_contrib = (len(matched_preferred) / total_pref_count) * 30.0
        score = round(req_contrib + pref_contrib, 1)

    # Bound between 0 and 100
    score = max(0.0, min(100.0, score))

    # Identify partially matched skills (e.g. backend language known, but specific framework missing)
    partially_matched = []
    if "Python" in norm_candidate and "FastAPI" in missing_skills:
        partially_matched.append("FastAPI (Familiar with core Python syntax; focus on ASGI & FastAPI async patterns)")
    if "JavaScript" in norm_candidate and "TypeScript" in missing_skills:
        partially_matched.append("TypeScript (Solid JavaScript foundation; bridge with static typing & interfaces)")
    if "React" in norm_candidate and "Next.js" in missing_skills:
        partially_matched.append("Next.js (React components mastered; learn App Router & SSR patterns)")
    if "SQL" in norm_candidate and "PostgreSQL" in missing_skills:
        partially_matched.append("PostgreSQL (Relational SQL knowledge present; learn Postgres-specific JSONB and indexing)")

    # Unmet job requirements
    unmet = [f"Required: {s}" for s in missing_required] + [f"Preferred: {s}" for s in missing_preferred]

    # Strengths to highlight
    strengths = [
        f"Verified alignment on {len(matched_skills)} key technical competencies: {', '.join(matched_skills[:5])}."
        if matched_skills else "Ready to begin targeted upskilling for this role."
    ]
    if len(matched_required) == total_req_count and total_req_count > 0:
        strengths.append("100% of core required technical qualifications are demonstrated in your profile/resume.")

    # Recommended next actions
    recommended = []
    if missing_required:
        top_missing = missing_required[:3]
        recommended.append(f"Prioritize building a project demonstrating your top missing required skills: {', '.join(top_missing)}.")
    if partially_matched:
        recommended.append("Leverage your foundational knowledge to quickly level up on partially matched frameworks.")
    recommended.append("Update your resume bullet points to explicitly reflect projects using matched skills.")

    return {
        "match_score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "partially_matched_skills": partially_matched,
        "unmet_requirements": unmet,
        "strengths_to_highlight": strengths,
        "recommended_actions": recommended
    }
