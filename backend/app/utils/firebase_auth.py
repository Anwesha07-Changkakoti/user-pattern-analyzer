import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status, Request, WebSocket
from typing import Optional, Dict, Callable
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase app if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate("C:\\Users\\palla\\OneDrive\\Desktop\\final77\\backend\\serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# ------------------ HTTP Version ------------------

async def get_current_user_optional(request: Request) -> Optional[Dict]:
    print("Request headers:", request.headers) 
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split("Bearer ")[-1]
    return await verify_firebase_token(token)

async def get_current_user(request: Request) -> Dict:
    user = await get_current_user_optional(request)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")
    return user

# ------------------ WebSocket Version ------------------

async def get_current_user_optional_ws(websocket: WebSocket) -> Optional[Dict]:
    auth_header: Optional[str] = websocket.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split("Bearer ")[-1]
    return await verify_firebase_token(token)

async def get_current_user_ws(websocket: WebSocket) -> Dict:
    user = await get_current_user_optional_ws(websocket)
    if not user:
        await websocket.close(code=1008)  # Policy Violation
        raise Exception("Unauthorized WebSocket access")
    return user

# ------------------ Shared Token Verifier ------------------

async def verify_firebase_token(token: str) -> Optional[Dict]:
    try:
        print("Received token:", token[:30]) 
        decoded_token = auth.verify_id_token(token)
        print("Decoded token:", decoded_token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "role": decoded_token.get("role", "user"),
        }
    except Exception as e:
        logger.warning(f"Firebase authentication failed: {e}")
        return None

# ------------------ Role Checker ------------------

def role_required(required_role: str) -> Callable:
    async def verify_role(user: Dict = Depends(get_current_user)):
        if user.get("role") != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return verify_role
