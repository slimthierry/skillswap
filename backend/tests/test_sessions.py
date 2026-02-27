import pytest
from httpx import AsyncClient


async def get_auth_token(client: AsyncClient, email: str, username: str) -> str:
    response = await client.post("/api/v1/auth/register", json={
        "email": email,
        "username": username,
        "password": "securepassword123",
    })
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_get_my_sessions(client: AsyncClient):
    token = await get_auth_token(client, "session@example.com", "sessionuser")

    response = await client.get(
        "/api/v1/sessions/my-sessions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_upcoming_sessions(client: AsyncClient):
    token = await get_auth_token(client, "upcoming@example.com", "upcominguser")

    response = await client.get(
        "/api/v1/sessions/upcoming",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_sessions_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/sessions/my-sessions")
    assert response.status_code in (401, 403)
