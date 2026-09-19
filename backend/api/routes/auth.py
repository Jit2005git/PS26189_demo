"""
auth.py
=======
Authentication endpoints:
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Security rules:
- NEVER trust role/user_id from frontend request data.
- NEVER accept a client-supplied role as authoritative.
- NEVER store plaintext passwords.
- NEVER log passwords or authentication tokens.
- NEVER expose password hashes or plaintext passwords through API responses.
- Appropriate HTTP 401 Unauthorized errors with generic failure messages.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status

from api.models import LoginRequest, LoginResponse, LogoutResponse, UserPublic
from api.dependencies import (
    get_user_repo,
    get_token_store,
    require_authenticated_user,
    extract_bearer_token
)
from modules.auth.models import User
from modules.auth.repository import UserRepository
from modules.auth.tokens import TokenStore


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Authenticate user credentials and obtain session bearer token",
    status_code=status.HTTP_200_OK
)
def login(
    login_data: LoginRequest,
    user_repo: UserRepository = Depends(get_user_repo),
    token_store: TokenStore = Depends(get_token_store)
):
    """
    Authenticates a user by username and password.
    Returns session bearer token and public user metadata.
    Role and user identity are strictly established from backend user records.
    """
    username = login_data.username.strip() if login_data.username else ""
    password = login_data.password if login_data.password else ""

    if not username or not password or not password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both username and password are required."
        )

    # 1. Look up user by username (case-insensitive)
    user = user_repo.get_by_username(username)
    if not user:
        # Uniform 401 error avoids leaking username existence
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 2. Check active status
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive. Please contact an administrator.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 3. Verify password hash using PBKDF2
    if not user.check_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 4. Create secure authenticated session token
    session = token_store.create_token(user)

    # 5. Return token and public projection (never password or hash)
    return LoginResponse(
        token=session.token,
        token_type="bearer",
        user=user.to_public()
    )


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Retrieve current authenticated user's public profile",
    status_code=status.HTTP_200_OK
)
def get_current_user_profile(
    current_user: User = Depends(require_authenticated_user)
):
    """
    Requires a valid bearer session token.
    Returns authenticated user information.
    Credentials and tokens are never exposed.
    """
    return current_user.to_public()


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Invalidate active session token and log out",
    status_code=status.HTTP_200_OK
)
def logout(
    request: Request,
    current_user: User = Depends(require_authenticated_user),
    token_store: TokenStore = Depends(get_token_store)
):
    """
    Revokes the active bearer session token.
    Subsequent requests with the revoked token are immediately rejected.
    """
    token = extract_bearer_token(request)
    if token:
        token_store.revoke_token(token)

    return LogoutResponse(
        success=True,
        message="Successfully logged out."
    )
