import pytest
from app.services.seed_service import seed_initial_skills

def get_auth_headers(client, email="user1@example.com"):
    """Helper fixture to register user and return Bearer Auth headers."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": email,
            "password": "password123"
        }
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# ==================== PROFILE TESTS ====================

def test_create_profile_authenticated(client):
    headers = get_auth_headers(client, "prof1@example.com")
    res = client.post(
        "/api/v1/profile",
        headers=headers,
        json={
            "college": "MIT",
            "degree": "B.Tech",
            "branch": "Computer Science",
            "graduation_year": 2026,
            "cgpa": 9.2,
            "target_role": "Full Stack Developer"
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["college"] == "MIT"
    assert data["target_role"] == "Full Stack Developer"
    assert data["completion_percentage"] > 0

def test_create_profile_unauthenticated(client):
    res = client.post(
        "/api/v1/profile",
        json={"college": "MIT"}
    )
    assert res.status_code == 401

def test_get_profile_authenticated(client):
    headers = get_auth_headers(client, "prof2@example.com")
    client.post(
        "/api/v1/profile",
        headers=headers,
        json={"college": "Stanford", "target_role": "AI Engineer"}
    )
    res = client.get("/api/v1/profile", headers=headers)
    assert res.status_code == 200
    assert res.json()["college"] == "Stanford"

def test_update_profile(client):
    headers = get_auth_headers(client, "prof3@example.com")
    client.post(
        "/api/v1/profile",
        headers=headers,
        json={"college": "Harvard"}
    )
    res = client.put(
        "/api/v1/profile",
        headers=headers,
        json={"college": "Harvard University", "bio": "Passionate developer"}
    )
    assert res.status_code == 200
    assert res.json()["college"] == "Harvard University"
    assert res.json()["bio"] == "Passionate developer"

def test_duplicate_profile_rejected(client):
    headers = get_auth_headers(client, "prof4@example.com")
    res1 = client.post(
        "/api/v1/profile",
        headers=headers,
        json={"college": "Oxford"}
    )
    assert res1.status_code == 201

    res2 = client.post(
        "/api/v1/profile",
        headers=headers,
        json={"college": "Oxford"}
    )
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

# ==================== SKILLS TESTS ====================

def test_get_available_skills(client):
    res = client.get("/api/v1/skills")
    assert res.status_code == 200
    skills = res.json()
    assert len(skills) > 0
    skill_names = [s["name"] for s in skills]
    assert "Python" in skill_names
    assert "React" in skill_names

def test_add_user_skill(client):
    headers = get_auth_headers(client, "skill1@example.com")
    res = client.post(
        "/api/v1/profile/skills",
        headers=headers,
        json={"skill_name": "C++", "proficiency_level": "Intermediate"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["proficiency_level"] == "Intermediate"
    assert data["skill"]["name"] == "C++"

def test_add_duplicate_user_skill_rejected(client):
    headers = get_auth_headers(client, "skill2@example.com")
    client.post(
        "/api/v1/profile/skills",
        headers=headers,
        json={"skill_name": "Python", "proficiency_level": "Beginner"}
    )
    res2 = client.post(
        "/api/v1/profile/skills",
        headers=headers,
        json={"skill_name": "Python", "proficiency_level": "Advanced"}
    )
    assert res2.status_code == 400
    assert "already added" in res2.json()["detail"]

def test_update_user_skill_proficiency(client):
    headers = get_auth_headers(client, "skill3@example.com")
    add_res = client.post(
        "/api/v1/profile/skills",
        headers=headers,
        json={"skill_name": "React", "proficiency_level": "Beginner"}
    )
    user_skill_id = add_res.json()["id"]

    update_res = client.put(
        f"/api/v1/profile/skills/{user_skill_id}",
        headers=headers,
        json={"proficiency_level": "Advanced"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["proficiency_level"] == "Advanced"

def test_remove_user_skill(client):
    headers = get_auth_headers(client, "skill4@example.com")
    add_res = client.post(
        "/api/v1/profile/skills",
        headers=headers,
        json={"skill_name": "FastAPI", "proficiency_level": "Beginner"}
    )
    user_skill_id = add_res.json()["id"]

    del_res = client.delete(f"/api/v1/profile/skills/{user_skill_id}", headers=headers)
    assert del_res.status_code == 200

    get_res = client.get("/api/v1/profile/skills", headers=headers)
    assert len(get_res.json()) == 0

def test_cannot_modify_other_user_skill(client):
    headers1 = get_auth_headers(client, "owner@example.com")
    headers2 = get_auth_headers(client, "attacker@example.com")

    add_res = client.post(
        "/api/v1/profile/skills",
        headers=headers1,
        json={"skill_name": "Docker", "proficiency_level": "Beginner"}
    )
    user_skill_id = add_res.json()["id"]

    # Attacker attempts to modify owner's skill
    attack_res = client.put(
        f"/api/v1/profile/skills/{user_skill_id}",
        headers=headers2,
        json={"proficiency_level": "Advanced"}
    )
    assert attack_res.status_code == 403

    # Attacker attempts to delete owner's skill
    attack_del = client.delete(f"/api/v1/profile/skills/{user_skill_id}", headers=headers2)
    assert attack_del.status_code == 403

# ==================== GOALS TESTS ====================

def test_create_and_get_goals(client):
    headers = get_auth_headers(client, "goal1@example.com")
    res = client.post(
        "/api/v1/goals",
        headers=headers,
        json={
            "target_role": "Full Stack Developer",
            "target_domain": "Web",
            "target_date": "2027",
            "priority": "High"
        }
    )
    assert res.status_code == 201
    assert res.json()["target_role"] == "Full Stack Developer"
    assert res.json()["is_primary"] is True

    get_res = client.get("/api/v1/goals", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1

def test_update_and_delete_goal(client):
    headers = get_auth_headers(client, "goal2@example.com")
    create_res = client.post(
        "/api/v1/goals",
        headers=headers,
        json={"target_role": "Backend Developer", "priority": "Medium"}
    )
    goal_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/v1/goals/{goal_id}",
        headers=headers,
        json={"priority": "High", "target_company_type": "FAANG"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["priority"] == "High"

    del_res = client.delete(f"/api/v1/goals/{goal_id}", headers=headers)
    assert del_res.status_code == 200

def test_cannot_modify_other_user_goal(client):
    headers1 = get_auth_headers(client, "goalowner@example.com")
    headers2 = get_auth_headers(client, "goalattacker@example.com")

    create_res = client.post(
        "/api/v1/goals",
        headers=headers1,
        json={"target_role": "DevOps Engineer"}
    )
    goal_id = create_res.json()["id"]

    attack_update = client.put(
        f"/api/v1/goals/{goal_id}",
        headers=headers2,
        json={"target_role": "Hacked Role"}
    )
    assert attack_update.status_code == 403

    attack_del = client.delete(f"/api/v1/goals/{goal_id}", headers=headers2)
    assert attack_del.status_code == 403

def test_data_persistence_across_login_sessions(client):
    """
    Test that profile data, skills (with updated proficiency), and career goals
    remain saved and accessible after logging out and logging back in.
    """
    email = "persistent_user@example.com"
    password = "securePassword123"

    # 1. Register and get initial session
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Persistent Student", "email": email, "password": password}
    )
    login1 = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token1 = login1.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # 2. Save Education & Career Profile
    prof_res = client.put(
        "/api/v1/profile",
        headers=headers1,
        json={
            "college": "IIT Bombay",
            "degree": "B.Tech",
            "branch": "Computer Science",
            "graduation_year": 2026,
            "cgpa": 9.15,
            "current_year": "3rd Year",
            "target_role": "Full Stack Developer",
            "target_domain": "Web Development",
            "preferred_work_mode": "Remote",
            "preferred_locations": "Bangalore, Remote"
        }
    )
    assert prof_res.status_code == 200

    # 3. Add skill and update proficiency
    skill_add = client.post(
        "/api/v1/profile/skills",
        headers=headers1,
        json={"skill_name": "TypeScript", "proficiency_level": "Beginner"}
    )
    assert skill_add.status_code == 201
    user_skill_id = skill_add.json()["id"]

    skill_update = client.put(
        f"/api/v1/profile/skills/{user_skill_id}",
        headers=headers1,
        json={"proficiency_level": "Advanced"}
    )
    assert skill_update.status_code == 200
    assert skill_update.json()["proficiency_level"] == "Advanced"

    # 4. Add career goal
    goal_res = client.post(
        "/api/v1/goals",
        headers=headers1,
        json={
            "target_role": "Lead Architect",
            "target_domain": "Cloud & Distributed Systems",
            "target_company_type": "Product Based",
            "target_date": "2027",
            "priority": "High",
            "is_primary": True
        }
    )
    assert goal_res.status_code == 201
    assert goal_res.json()["is_primary"] is True

    # 5. SIMULATE LOGOUT & RE-LOGIN: Discard token1, obtain brand new token2
    del headers1
    login2 = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token2 = login2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # 6. Verify profile data persists across session
    saved_prof = client.get("/api/v1/profile", headers=headers2)
    assert saved_prof.status_code == 200
    p_data = saved_prof.json()
    assert p_data["college"] == "IIT Bombay"
    assert p_data["degree"] == "B.Tech"
    assert p_data["branch"] == "Computer Science"
    assert p_data["graduation_year"] == 2026
    assert p_data["cgpa"] == 9.15
    assert p_data["target_role"] == "Full Stack Developer"
    assert p_data["target_domain"] == "Web Development"

    # 7. Verify skills persist with updated proficiency
    saved_skills = client.get("/api/v1/profile/skills", headers=headers2)
    assert saved_skills.status_code == 200
    s_list = saved_skills.json()
    assert len(s_list) >= 1
    ts_skill = next((s for s in s_list if s["skill"]["name"] == "TypeScript"), None)
    assert ts_skill is not None
    assert ts_skill["proficiency_level"] == "Advanced"

    # 8. Verify career goals persist
    saved_goals = client.get("/api/v1/goals", headers=headers2)
    assert saved_goals.status_code == 200
    g_list = saved_goals.json()
    assert len(g_list) >= 1
    primary_g = next((g for g in g_list if g["target_role"] == "Lead Architect"), None)
    assert primary_g is not None
    assert primary_g["target_domain"] == "Cloud & Distributed Systems"
    assert primary_g["is_primary"] is True
    assert primary_g["priority"] == "High"
