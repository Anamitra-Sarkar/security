"""
Unit tests for JWT authentication utilities.
"""
import pytest
from backend.app.core.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from fastapi import HTTPException


class TestAuth:
    def test_hash_and_verify_password(self):
        plain = "testpassword123"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed)
        assert not verify_password("wrongpassword", hashed)

    def test_create_and_decode_token(self):
        token = create_access_token(subject="user-123")
        payload = decode_token(token)
        assert payload["sub"] == "user-123"
        assert "exp" in payload

    def test_invalid_token_raises(self):
        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.here")
        assert exc_info.value.status_code == 401
