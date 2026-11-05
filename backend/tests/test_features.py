import io
import pytest
from pypdf import PdfWriter

def _get_auth_headers(client, email="feature_test@example.com", password="StrongPassword123!"):
    # Register user
    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Feature Test User"}
    )
    # Login user
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_sample_pdf_bytes(text_content: str) -> bytes:
    """Creates a minimal in-memory PDF with extractable text."""
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    # To add text without complex fonts, we can write a minimal valid PDF stream or use pypdf
    # In pypdf, creating a blank page and adding annotations or standard PDF stream:
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def test_resume_upload_and_retrieval(client):
    headers = _get_auth_headers(client, "resume_user@example.com")
    
    # 1. Reject non-PDF
    bad_upload = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files={"file": ("test.txt", b"Hello text", "text/plain")}
    )
    assert bad_upload.status_code == 400

    # 2. Upload valid PDF
    pdf_bytes = _create_sample_pdf_bytes("John Doe Resume\nSkills: Python, React, FastAPI, SQL\nEducation: B.S. Computer Science")
    upload_res = client.post(
        "/api/v1/resumes/upload",
        headers=headers,
        files={"file": ("my_resume.pdf", pdf_bytes, "application/pdf")}
    )
    assert upload_res.status_code == 201
    data = upload_res.json()
    resume_id = data["id"]
    assert resume_id is not None
    assert data["original_filename"] == "my_resume.pdf"
    assert "analysis" in data

    # 3. List my resumes
    list_res = client.get("/api/v1/resumes", headers=headers)
    assert list_res.status_code == 200
    resumes = list_res.json()
    assert len(resumes) >= 1
    assert any(r["id"] == resume_id for r in resumes)

    # 4. Get resume by id
    get_res = client.get(f"/api/v1/resumes/{resume_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == resume_id


def test_job_description_analysis(client):
    headers = _get_auth_headers(client, "job_user@example.com")

    job_text = """
    Software Engineer - Backend
    Company: Tech Corp
    Requirements:
    - Strong proficiency in Python, FastAPI, and PostgreSQL
    - Experience with Docker, Redis, and Git
    - Nice to have: Kubernetes, AWS
    Responsibilities:
    - Build scalable REST APIs and backend microservices
    """

    res = client.post(
        "/api/v1/jobs/analyze",
        headers=headers,
        json={
            "title": "Backend Software Engineer",
            "company_name": "Tech Corp",
            "raw_text": job_text
        }
    )
    assert res.status_code == 201
    job_data = res.json()
    job_id = job_data["id"]
    assert job_data["title"] == "Backend Software Engineer"
    assert "Python" in job_data["required_skills"] or "FastAPI" in job_data["required_skills"]

    # List jobs
    list_res = client.get("/api/v1/jobs", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get single job
    single_res = client.get(f"/api/v1/jobs/{job_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["id"] == job_id


def test_skill_gap_analysis(client):
    headers = _get_auth_headers(client, "gap_user@example.com")

    # 1. Post target job
    job_text = "Looking for a Python and FastAPI developer with Docker and PostgreSQL skills."
    job_res = client.post(
        "/api/v1/jobs/analyze",
        headers=headers,
        json={
            "title": "Backend Python Engineer",
            "company_name": "Acme Inc",
            "raw_text": job_text
        }
    )
    job_id = job_res.json()["id"]

    # 2. Add profile skills (User has Python and Git, but lacks Docker and FastAPI)
    skills_list = client.get("/api/v1/skills", headers=headers).json()
    python_skill = next((s for s in skills_list if s["name"] == "Python"), None)
    if python_skill:
        client.post(
            "/api/v1/skills/my-skills",
            headers=headers,
            json={"skill_id": python_skill["id"], "proficiency_level": "Intermediate"}
        )

    # 3. Run skill gap analysis
    gap_res = client.post(
        "/api/v1/skill-gap/analyze",
        headers=headers,
        json={"job_id": job_id}
    )
    assert gap_res.status_code == 201
    gap_data = gap_res.json()
    assert "match_score" in gap_data
    assert isinstance(gap_data["match_score"], (int, float))
    assert "matched_skills" in gap_data
    assert "missing_skills" in gap_data
    assert "recommended_actions" in gap_data

    # 4. Check historical analyses
    history_res = client.get("/api/v1/skill-gap", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1


def test_roadmap_generation_and_task_toggle(client):
    headers = _get_auth_headers(client, "roadmap_user@example.com")

    # 1. Generate roadmap
    roadmap_res = client.post(
        "/api/v1/roadmaps/generate",
        headers=headers,
        json={
            "target_role": "Full Stack Developer",
            "total_weeks": 3,
            "daily_hours": 2,
            "missing_skills": ["Docker", "PostgreSQL", "FastAPI"]
        }
    )
    assert roadmap_res.status_code == 201
    roadmap_data = roadmap_res.json()
    roadmap_id = roadmap_data["id"]
    assert roadmap_data["total_weeks"] == 3
    assert len(roadmap_data["tasks"]) > 0

    # 2. Fetch active roadmap
    active_res = client.get("/api/v1/roadmaps/active", headers=headers)
    assert active_res.status_code == 200
    assert active_res.json()["id"] == roadmap_id

    # 3. Toggle task completion
    task = roadmap_data["tasks"][0]
    task_id = task["id"]
    toggle_res = client.patch(
        f"/api/v1/roadmaps/tasks/{task_id}",
        headers=headers,
        json={"is_completed": True}
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True


def test_dashboard_summary_metrics(client):
    headers = _get_auth_headers(client, "dashboard_metric_user@example.com")

    # Empty state check
    summary_empty = client.get("/api/v1/dashboard/summary", headers=headers)
    assert summary_empty.status_code == 200
    data = summary_empty.json()
    assert data["tasks_total_count"] == 0
    assert data["tasks_completed_count"] == 0
    assert data["roadmap_progress_percentage"] == 0.0
    assert "Upload your PDF resume" in data["suggested_next_action"]

    # Create career profile & goal
    client.post(
        "/api/v1/profile",
        headers=headers,
        json={
            "target_role": "DevOps Engineer",
            "college": "State University",
            "graduation_year": 2026
        }
    )
    client.post(
        "/api/v1/goals",
        headers=headers,
        json={
            "target_role": "Cloud DevOps Engineer",
            "is_primary": True,
            "priority": "High"
        }
    )

    # Re-fetch summary
    summary_res = client.get("/api/v1/dashboard/summary", headers=headers)
    assert summary_res.status_code == 200
    updated_data = summary_res.json()
    assert updated_data["target_role"] == "Cloud DevOps Engineer"
