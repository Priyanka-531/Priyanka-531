from sqlalchemy.orm import Session
from app.models.skill import Skill

INITIAL_SKILLS = [
    # Programming
    {"name": "C", "category": "Programming"},
    {"name": "C++", "category": "Programming"},
    {"name": "Python", "category": "Programming"},
    {"name": "Java", "category": "Programming"},
    {"name": "JavaScript", "category": "Programming"},
    {"name": "TypeScript", "category": "Programming"},

    # Web Development
    {"name": "HTML", "category": "Web Development"},
    {"name": "CSS", "category": "Web Development"},
    {"name": "React", "category": "Web Development"},
    {"name": "Node.js", "category": "Web Development"},
    {"name": "Express", "category": "Web Development"},
    {"name": "FastAPI", "category": "Web Development"},
    {"name": "Django", "category": "Web Development"},

    # Database
    {"name": "PostgreSQL", "category": "Database"},
    {"name": "MySQL", "category": "Database"},
    {"name": "MongoDB", "category": "Database"},

    # AI/ML
    {"name": "Machine Learning", "category": "AI/ML"},
    {"name": "Deep Learning", "category": "AI/ML"},
    {"name": "Generative AI", "category": "AI/ML"},
    {"name": "NLP", "category": "AI/ML"},

    # Cloud
    {"name": "AWS", "category": "Cloud"},
    {"name": "Google Cloud", "category": "Cloud"},
    {"name": "Azure", "category": "Cloud"},

    # DevOps
    {"name": "Docker", "category": "DevOps"},
    {"name": "Git", "category": "DevOps"},
    {"name": "GitHub", "category": "DevOps"},

    # DSA
    {"name": "Data Structures", "category": "DSA"},
    {"name": "Algorithms", "category": "DSA"},
]

def seed_initial_skills(db: Session):
    """
    Safely seed predefined skills into the database.
    Does not duplicate existing skills.
    """
    for skill_data in INITIAL_SKILLS:
        existing = db.query(Skill).filter(Skill.name == skill_data["name"]).first()
        if not existing:
            db.add(Skill(name=skill_data["name"], category=skill_data["category"]))
    db.commit()
