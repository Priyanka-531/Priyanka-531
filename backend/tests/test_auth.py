def test_register_user_success(client):
    """Test user registration with valid credentials."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Student",
            "email": "student@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "student@example.com"
    assert data["full_name"] == "Test Student"
    assert "id" in data
    assert "hashed_password" not in data  # Never expose password hash

def test_register_duplicate_email(client):
    """Test registering duplicate email fails with 400 Bad Request."""
    payload = {
        "full_name": "Test Student",
        "email": "duplicate@example.com",
        "password": "securepassword123"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_login_success(client):
    """Test user login returns valid JWT token."""
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Login User",
            "email": "login@example.com",
            "password": "mypassword"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "mypassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    """Test login with incorrect password fails with 401 Unauthorized."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Login User",
            "email": "login2@example.com",
            "password": "mypassword"
        }
    )
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login2@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_get_me_valid_jwt(client):
    """Test GET /auth/me returns current user profile when valid JWT provided."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Authenticated Student",
            "email": "auth@example.com",
            "password": "mypassword"
        }
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "auth@example.com",
            "password": "mypassword"
        }
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "auth@example.com"
    assert response.json()["full_name"] == "Authenticated Student"

def test_get_me_missing_jwt(client):
    """Test GET /auth/me fails with 401 Unauthorized when no JWT provided."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_invalid_jwt(client):
    """Test GET /auth/me fails with 401 Unauthorized when invalid JWT provided."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_fake_token_123"}
    )
    assert response.status_code == 401

def test_create_user_endpoint(client):
    """Test creating user via /api/v1/users endpoint."""
    response = client.post(
        "/api/v1/users",
        json={
            "full_name": "Direct User",
            "email": "direct@example.com",
            "password": "directpassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "direct@example.com"
    assert data["full_name"] == "Direct User"
    assert "id" in data
    assert "hashed_password" not in data

def test_login_form_urlencoded(client):
    """Test user login with form-urlencoded data on /auth/login."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Form User",
            "email": "formuser@example.com",
            "password": "mypassword"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "formuser@example.com",
            "password": "mypassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_oauth2_token_endpoint(client):
    """Test OAuth2 token endpoint /auth/token with form-data."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Token User",
            "email": "tokenuser@example.com",
            "password": "mypassword"
        }
    )
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": "tokenuser@example.com",
            "password": "mypassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_case_insensitive(client):
    """Test user can log in with different email casing."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Case User",
            "email": "caseuser@example.com",
            "password": "mypassword123"
        }
    )
    # Login with uppercase characters
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "CaseUser@Example.COM",
            "password": "mypassword123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_register_duplicate_case_insensitive(client):
    """Test registering duplicate email with different casing is rejected with 400."""
    res1 = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Case User One",
            "email": "unique@example.com",
            "password": "mypassword123"
        }
    )
    assert res1.status_code == 201

    res2 = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Case User Two",
            "email": "Unique@EXAMPLE.com",
            "password": "mypassword123"
        }
    )
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_login_with_whitespace(client):
    """Test login trims leading and trailing whitespace from email."""
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Space User",
            "email": "spaceuser@example.com",
            "password": "mypassword123"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "  spaceuser@example.com  ",
            "password": "mypassword123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_malformed_email_no_500(client):
    """Test login with malformed email returns 401 or 422, never 500."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "not-an-email",
            "password": "somepassword"
        }
    )
    assert response.status_code in [400, 401, 422]
    assert response.status_code != 500
