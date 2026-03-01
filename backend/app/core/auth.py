"""
Firebase Authentication utilities.
Verifies Firebase ID tokens issued by the frontend (Firebase Auth SDK).

Env vars: FIREBASE_PROJECT_ID (used implicitly by firebase-admin)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> str:
    """
    Dependency: extracts and verifies the Firebase ID token from the
    Authorization: Bearer <id_token> header.
    Returns the Firebase UID of the authenticated user.
    """
    id_token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase ID token has expired. Please re-authenticate.",
        )
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )
    return decoded["uid"]
