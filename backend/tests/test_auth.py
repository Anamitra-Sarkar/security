"""
Unit tests for Firebase token verification (auth.py).
Mocks firebase_admin.auth so no real Firebase project is needed in CI.
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials


class TestFirebaseTokenVerification:

    @patch("backend.app.core.auth.firebase_auth")
    async def test_valid_token_returns_uid(self, mock_fb_auth):
        """A valid Firebase ID token should return the uid."""
        from backend.app.core.auth import get_current_user

        mock_fb_auth.verify_id_token.return_value = {"uid": "user-abc-123"}
        mock_fb_auth.ExpiredIdTokenError = Exception
        mock_fb_auth.InvalidIdTokenError = Exception

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake-valid-token")
        uid = await get_current_user(credentials=creds)
        assert uid == "user-abc-123"
        mock_fb_auth.verify_id_token.assert_called_once_with("fake-valid-token")

    @patch("backend.app.core.auth.firebase_auth")
    async def test_expired_token_raises_401(self, mock_fb_auth):
        """An expired Firebase token should raise HTTP 401."""
        from backend.app.core.auth import get_current_user

        class FakeExpiredError(Exception):
            pass

        mock_fb_auth.ExpiredIdTokenError = FakeExpiredError
        mock_fb_auth.InvalidIdTokenError = Exception
        mock_fb_auth.verify_id_token.side_effect = FakeExpiredError("expired")

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="expired-token")
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds)
        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()

    @patch("backend.app.core.auth.firebase_auth")
    async def test_invalid_token_raises_401(self, mock_fb_auth):
        """A tampered / invalid Firebase token should raise HTTP 401."""
        from backend.app.core.auth import get_current_user

        class FakeInvalidError(Exception):
            pass

        mock_fb_auth.ExpiredIdTokenError = Exception
        mock_fb_auth.InvalidIdTokenError = FakeInvalidError
        mock_fb_auth.verify_id_token.side_effect = FakeInvalidError("invalid")

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token")
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=creds)
        assert exc_info.value.status_code == 401
