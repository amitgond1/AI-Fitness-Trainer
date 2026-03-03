import base64
from typing import Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from pose import analyze_pose_session, detect_landmarks_from_image, recommend_plan, chat_reply, reset_session

app = FastAPI(title="AI Fitness Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Landmark(BaseModel):
    x: float
    y: float
    z: float = 0.0
    visibility: float = 1.0


class PoseRequest(BaseModel):
    session_id: str = Field(default="default-session")
    exercise_hint: str = Field(default="Pushups")
    reset_session: bool = Field(default=False)
    landmarks: Optional[List[Landmark]] = None
    image_base64: Optional[str] = None


class RecommendRequest(BaseModel):
    user: Dict = Field(default_factory=dict)
    history: List[Dict] = Field(default_factory=list)


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-server"}


@app.post("/pose")
def pose(request: PoseRequest):
    if request.reset_session:
        reset_session(request.session_id)

    landmarks = request.landmarks
    if (not landmarks or len(landmarks) == 0) and request.image_base64:
        try:
            image_bytes = base64.b64decode(request.image_base64)
            landmarks = detect_landmarks_from_image(image_bytes)
        except Exception as exc:
            return {
                "exercise": request.exercise_hint,
                "reps": 0,
                "posture": {"status": "error", "warnings": [f"Image processing failed: {str(exc)}"]},
            }

    if not landmarks:
        return {
            "exercise": request.exercise_hint,
            "reps": 0,
            "posture": {"status": "warning", "warnings": ["No landmarks detected"]},
        }

    result = analyze_pose_session(
        session_id=request.session_id,
        exercise=request.exercise_hint,
        landmarks=[lm.model_dump() if hasattr(lm, "model_dump") else lm for lm in landmarks],
    )

    return result


@app.post("/recommend")
def recommend(request: RecommendRequest):
    return recommend_plan(request.user, request.history)


@app.post("/chat")
def chat(request: ChatRequest):
    return {"reply": chat_reply(request.message)}
