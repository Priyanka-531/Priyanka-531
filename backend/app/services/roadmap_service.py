from typing import List, Dict, Any, Optional
from app.services.skill_gap_service import normalize_skill

# Legitimate authoritative documentation URLs for verified skills (NO fabricated URLs)
VERIFIED_RESOURCES = {
    "Python": {
        "name": "Official Python Tutorial",
        "url": "https://docs.python.org/3/tutorial/"
    },
    "FastAPI": {
        "name": "FastAPI Official Tutorial",
        "url": "https://fastapi.tiangolo.com/tutorial/"
    },
    "React": {
        "name": "React Official Documentation (Learn React)",
        "url": "https://react.dev/learn"
    },
    "TypeScript": {
        "name": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html"
    },
    "PostgreSQL": {
        "name": "PostgreSQL Official Documentation",
        "url": "https://www.postgresql.org/docs/current/tutorial.html"
    },
    "Docker": {
        "name": "Docker Official Get Started Guide",
        "url": "https://docs.docker.com/get-started/"
    },
    "Git": {
        "name": "GitHub Docs - Getting Started with Git",
        "url": "https://docs.github.com/en/get-started"
    },
    "GitHub": {
        "name": "GitHub Skills - Interactive Learning",
        "url": "https://skills.github.com/"
    },
    "JavaScript": {
        "name": "MDN Web Docs - JavaScript Guide",
        "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    "HTML": {
        "name": "MDN Web Docs - HTML Basics",
        "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"
    },
    "CSS": {
        "name": "MDN Web Docs - CSS Basics",
        "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics"
    },
    "Tailwind CSS": {
        "name": "Tailwind CSS Official Documentation",
        "url": "https://tailwindcss.com/docs"
    },
    "Node.js": {
        "name": "Node.js Official Documentation Guide",
        "url": "https://nodejs.org/en/docs/guides"
    },
    "Redis": {
        "name": "Redis Official Documentation",
        "url": "https://redis.io/docs/"
    },
    "Next.js": {
        "name": "Next.js Official Documentation",
        "url": "https://nextjs.org/docs"
    },
    "Kubernetes": {
        "name": "Kubernetes Official Basics Tutorial",
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"
    },
    "SQL": {
        "name": "PostgreSQL SQL Tutorial",
        "url": "https://www.postgresql.org/docs/current/tutorial-sql.html"
    }
}

DEFAULT_RESOURCE = {
    "name": "MDN Web Development Guides",
    "url": "https://developer.mozilla.org/en-US/docs/Learn"
}


def build_roadmap_plan(
    target_role: str,
    missing_skills: List[str],
    daily_hours: int = 2,
    total_weeks: int = 4
) -> List[Dict[str, Any]]:
    """
    Constructs a structured, achievable week-by-week learning roadmap for students.
    Maps missing technical skills to actionable daily tasks with real official documentation.
    """
    clean_skills = [normalize_skill(s) for s in missing_skills if s and s.strip()]
    if not clean_skills:
        clean_skills = ["Software Architecture", "API Design", "Testing & CI/CD", "Portfolio Project"]

    task_duration_minutes = min(120, max(45, daily_hours * 60))
    tasks = []

    # Distribute skills across weeks
    skills_per_week = max(1, len(clean_skills) // total_weeks + (1 if len(clean_skills) % total_weeks != 0 else 0))

    current_skill_idx = 0
    total_skills = len(clean_skills)

    for week in range(1, total_weeks + 1):
        # Pick 1-2 skills for this week
        week_skills = []
        for _ in range(skills_per_week):
            if current_skill_idx < total_skills:
                week_skills.append(clean_skills[current_skill_idx])
                current_skill_idx += 1

        if not week_skills:
            # If all skills covered, focus on capstone and testing in remaining weeks
            week_skills = [f"Full-Stack Integration for {target_role}"]

        primary_skill = week_skills[0]
        res = VERIFIED_RESOURCES.get(primary_skill, DEFAULT_RESOURCE)

        # 5 actionable days per week (achievable student schedule)
        # Day 1: Concept & Setup
        tasks.append({
            "week_number": week,
            "day_number": 1,
            "title": f"Fundamentals & Environment Setup: {primary_skill}",
            "explanation": f"Read core concepts, understand architecture patterns, and configure your local development environment for {primary_skill}.",
            "skill_category": "Foundation",
            "estimated_duration_minutes": task_duration_minutes,
            "resource_name": res["name"],
            "resource_url": res["url"],
            "is_completed": False
        })

        # Day 2: Guided Hands-on Exercises
        tasks.append({
            "week_number": week,
            "day_number": 2,
            "title": f"Hands-on Exercises with {primary_skill}",
            "explanation": f"Implement initial code samples, standard functions, and error handling with {primary_skill} following official docs.",
            "skill_category": "Hands-on Practice",
            "estimated_duration_minutes": task_duration_minutes,
            "resource_name": res["name"],
            "resource_url": res["url"],
            "is_completed": False
        })

        # Day 3: Intermediate Feature Implementation
        secondary_skill = week_skills[1] if len(week_skills) > 1 else primary_skill
        sec_res = VERIFIED_RESOURCES.get(secondary_skill, res)
        tasks.append({
            "week_number": week,
            "day_number": 3,
            "title": f"Integrate {secondary_skill} into API / Data Flow",
            "explanation": f"Connect {secondary_skill} with realistic application state, handling async operations and edge cases.",
            "skill_category": "Integration",
            "estimated_duration_minutes": task_duration_minutes,
            "resource_name": sec_res["name"],
            "resource_url": sec_res["url"],
            "is_completed": False
        })

        # Day 4: Mini-Project Feature Build
        tasks.append({
            "week_number": week,
            "day_number": 4,
            "title": f"Build a Portfolio Feature Demonstrating {primary_skill}",
            "explanation": f"Create an independent, working repository feature demonstrating {primary_skill} tailored to {target_role}.",
            "skill_category": "Project Work",
            "estimated_duration_minutes": task_duration_minutes,
            "resource_name": "GitHub Skills - Open Source Best Practices",
            "resource_url": "https://skills.github.com/",
            "is_completed": False
        })

        # Day 5: Testing, Documentation & Review
        tasks.append({
            "week_number": week,
            "day_number": 5,
            "title": f"Unit Tests and Documentation Review for Week {week}",
            "explanation": f"Write unit tests verifying your implementation and document the project in README format with architecture notes.",
            "skill_category": "Quality Assurance",
            "estimated_duration_minutes": task_duration_minutes,
            "resource_name": "Official Python & Software Testing Guides",
            "resource_url": "https://docs.python.org/3/library/unittest.html",
            "is_completed": False
        })

    return tasks
