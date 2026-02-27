import pytest
from httpx import AsyncClient


async def get_auth_token(client: AsyncClient) -> str:
    response = await client.post("/api/v1/auth/register", json={
        "email": "dashboard@example.com",
        "username": "dashuser",
        "password": "securepassword123",
    })
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_my_dashboard(client: AsyncClient):
    token = await get_auth_token(client)

    response = await client.get(
        "/api/v1/dashboard/my-dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data
    assert "upcoming_sessions_count" in data
    assert "completed_sessions_count" in data
    assert "total_hours_taught" in data
    assert "total_hours_learned" in data
    assert "rating_avg" in data
    assert "skills_offered_count" in data
    assert "skills_wanted_count" in data


@pytest.mark.asyncio
async def test_community_stats(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/community-stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "total_skills" in data
    assert "total_sessions" in data
    assert "total_hours_exchanged" in data


@pytest.mark.asyncio
async def test_skill_map(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/skill-map")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_top_teachers(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/top-teachers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_dashboard_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/my-dashboard")
    assert response.status_code in (401, 403)
