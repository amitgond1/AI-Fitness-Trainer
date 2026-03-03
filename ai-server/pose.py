import time
from datetime import datetime
from typing import Dict, List

import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose
pose_model = mp_pose.Pose(
    static_image_mode=True,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)

SESSION_STORE: Dict[str, Dict] = {}
CONNECTIONS = [(a, b) for a, b in mp_pose.POSE_CONNECTIONS]
MIN_VISIBILITY = 0.45
REP_COOLDOWN_SECONDS = 0.45


def _point(landmarks, idx):
    lm = landmarks[idx]
    return np.array([lm["x"], lm["y"]], dtype=np.float32)


def _visibility(landmarks, idx):
    return float(landmarks[idx].get("visibility", 1.0))


def _avg_visibility(landmarks, indices):
    if not indices:
        return 0.0
    return sum(_visibility(landmarks, idx) for idx in indices) / len(indices)


def _angle(a, b, c):
    ba = a - b
    bc = c - b
    denom = np.linalg.norm(ba) * np.linalg.norm(bc)
    if denom == 0:
        return 0.0
    cos_val = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_val)))


def _ensure_session(session_id):
    if session_id not in SESSION_STORE:
        SESSION_STORE[session_id] = {
            "reps": 0,
            "stage": "up",
            "last_seen": datetime.utcnow().isoformat(),
            "plank_start": None,
            "last_rep_at": 0.0,
            "exercise": "",
        }
    SESSION_STORE[session_id]["last_seen"] = datetime.utcnow().isoformat()
    return SESSION_STORE[session_id]


def reset_session(session_id: str):
    return SESSION_STORE.pop(session_id, None) is not None


def _reset_state_for_exercise(state, exercise_name):
    state["exercise"] = exercise_name
    state["reps"] = 0
    state["stage"] = "hold" if "plank" in exercise_name else "up"
    state["plank_start"] = None
    state["last_rep_at"] = 0.0


def _pick_side_for_push(landmarks):
    left_indices = {"shoulder": 11, "elbow": 13, "wrist": 15, "hip": 23, "ankle": 27}
    right_indices = {"shoulder": 12, "elbow": 14, "wrist": 16, "hip": 24, "ankle": 28}

    left_score = _avg_visibility(landmarks, left_indices.values())
    right_score = _avg_visibility(landmarks, right_indices.values())
    if right_score > left_score:
        return right_indices, right_score
    return left_indices, left_score


def _pick_side_for_leg(landmarks):
    left_indices = {"hip": 23, "knee": 25, "ankle": 27, "shoulder": 11}
    right_indices = {"hip": 24, "knee": 26, "ankle": 28, "shoulder": 12}

    left_score = _avg_visibility(landmarks, left_indices.values())
    right_score = _avg_visibility(landmarks, right_indices.values())
    if right_score > left_score:
        return right_indices, right_score
    return left_indices, left_score


def _analyze_pushup(state, landmarks):
    indices, confidence = _pick_side_for_push(landmarks)
    if confidence < MIN_VISIBILITY:
        return {
            "exercise": "Pushups",
            "reps": state["reps"],
            "stage": state["stage"],
            "metrics": {"confidence": round(confidence, 2)},
            "posture": {"status": "warning", "warnings": ["Move into frame for better tracking"]},
        }

    shoulder = _point(landmarks, indices["shoulder"])
    elbow = _point(landmarks, indices["elbow"])
    wrist = _point(landmarks, indices["wrist"])
    hip = _point(landmarks, indices["hip"])
    ankle = _point(landmarks, indices["ankle"])

    elbow_angle = _angle(shoulder, elbow, wrist)
    back_angle = _angle(shoulder, hip, ankle)

    warnings = []
    if back_angle < 150:
        warnings.append("Keep your back straight")

    now = time.time()
    if elbow_angle < 100:
        state["stage"] = "down"
    elif elbow_angle > 165 and state["stage"] == "down":
        if now - state.get("last_rep_at", 0.0) >= REP_COOLDOWN_SECONDS:
            state["reps"] += 1
            state["last_rep_at"] = now
        state["stage"] = "up"

    return {
        "exercise": "Pushups",
        "reps": state["reps"],
        "stage": state["stage"],
        "metrics": {
            "elbow_angle": round(elbow_angle, 2),
            "back_angle": round(back_angle, 2),
            "confidence": round(confidence, 2),
        },
        "posture": {
            "status": "correct" if not warnings else "warning",
            "warnings": warnings,
        },
    }


def _analyze_squat(state, landmarks):
    indices, confidence = _pick_side_for_leg(landmarks)
    if confidence < MIN_VISIBILITY:
        return {
            "exercise": "Squats",
            "reps": state["reps"],
            "stage": state["stage"],
            "metrics": {"confidence": round(confidence, 2)},
            "posture": {"status": "warning", "warnings": ["Move into frame for better tracking"]},
        }

    hip = _point(landmarks, indices["hip"])
    knee = _point(landmarks, indices["knee"])
    ankle = _point(landmarks, indices["ankle"])

    knee_angle = _angle(hip, knee, ankle)
    warnings = []

    now = time.time()
    if knee_angle < 90:
        state["stage"] = "down"
    if knee_angle > 155 and state["stage"] == "down" and now - state.get("last_rep_at", 0.0) >= REP_COOLDOWN_SECONDS:
        state["stage"] = "up"
        state["reps"] += 1
        state["last_rep_at"] = now
    if knee_angle < 70:
        warnings.append("Avoid going too deep")

    return {
        "exercise": "Squats",
        "reps": state["reps"],
        "stage": state["stage"],
        "metrics": {"knee_angle": round(knee_angle, 2), "confidence": round(confidence, 2)},
        "posture": {
            "status": "correct" if not warnings else "warning",
            "warnings": warnings,
        },
    }


def _analyze_lunge(state, landmarks):
    indices, confidence = _pick_side_for_leg(landmarks)
    if confidence < MIN_VISIBILITY:
        return {
            "exercise": "Lunges",
            "reps": state["reps"],
            "stage": state["stage"],
            "metrics": {"confidence": round(confidence, 2)},
            "posture": {"status": "warning", "warnings": ["Move into frame for better tracking"]},
        }

    hip = _point(landmarks, indices["hip"])
    knee = _point(landmarks, indices["knee"])
    ankle = _point(landmarks, indices["ankle"])

    knee_angle = _angle(hip, knee, ankle)
    warnings = []

    now = time.time()
    if knee_angle < 95:
        state["stage"] = "down"
    if knee_angle > 150 and state["stage"] == "down" and now - state.get("last_rep_at", 0.0) >= REP_COOLDOWN_SECONDS:
        state["stage"] = "up"
        state["reps"] += 1
        state["last_rep_at"] = now
    if knee_angle < 80:
        warnings.append("Lower your hips with control")

    return {
        "exercise": "Lunges",
        "reps": state["reps"],
        "stage": state["stage"],
        "metrics": {"knee_angle": round(knee_angle, 2), "confidence": round(confidence, 2)},
        "posture": {
            "status": "correct" if not warnings else "warning",
            "warnings": warnings,
        },
    }


def _analyze_plank(state, landmarks):
    indices, confidence = _pick_side_for_leg(landmarks)
    if confidence < MIN_VISIBILITY:
        state["plank_start"] = None
        return {
            "exercise": "Plank",
            "reps": state["reps"],
            "stage": "hold",
            "metrics": {"confidence": round(confidence, 2)},
            "posture": {"status": "warning", "warnings": ["Move into frame for better tracking"]},
        }

    shoulder = _point(landmarks, indices["shoulder"])
    hip = _point(landmarks, indices["hip"])
    ankle = _point(landmarks, indices["ankle"])

    body_angle = _angle(shoulder, hip, ankle)
    warnings = []

    now = datetime.utcnow()
    if 155 <= body_angle <= 190:
        if state["plank_start"] is None:
            state["plank_start"] = now
    else:
        warnings.append("Lower your hips")
        state["plank_start"] = None

    hold_seconds = 0
    if state["plank_start"]:
        hold_seconds = int((now - state["plank_start"]).total_seconds())
        state["reps"] = hold_seconds

    return {
        "exercise": "Plank",
        "reps": state["reps"],
        "stage": "hold",
        "metrics": {"body_angle": round(body_angle, 2), "hold_seconds": hold_seconds, "confidence": round(confidence, 2)},
        "posture": {
            "status": "correct" if not warnings else "warning",
            "warnings": warnings,
        },
    }


def analyze_pose_session(session_id: str, exercise: str, landmarks: List[Dict]):
    state = _ensure_session(session_id)
    exercise_name = exercise.lower().strip()
    if state.get("exercise") != exercise_name:
        _reset_state_for_exercise(state, exercise_name)

    if len(landmarks) < 28:
        return {
            "exercise": exercise,
            "reps": state["reps"],
            "posture": {"status": "warning", "warnings": ["Incomplete body landmarks"]},
            "skeleton": {"connections": CONNECTIONS, "points": landmarks},
        }

    if "push" in exercise_name:
        result = _analyze_pushup(state, landmarks)
    elif "squat" in exercise_name:
        result = _analyze_squat(state, landmarks)
    elif "lunge" in exercise_name:
        result = _analyze_lunge(state, landmarks)
    elif "plank" in exercise_name:
        result = _analyze_plank(state, landmarks)
    else:
        result = {
            "exercise": exercise,
            "reps": state["reps"],
            "stage": state["stage"],
            "posture": {"status": "warning", "warnings": ["Exercise not supported"]},
        }

    result["skeleton"] = {"connections": CONNECTIONS, "points": landmarks}
    return result


def detect_landmarks_from_image(image_bytes: bytes):
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        return []

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    result = pose_model.process(rgb)
    if not result.pose_landmarks:
        return []

    landmarks = []
    for lm in result.pose_landmarks.landmark:
        landmarks.append(
            {
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z),
                "visibility": float(lm.visibility),
            }
        )
    return landmarks


def recommend_plan(user, history):
    goal = user.get("goal", "Beginner")
    age = int(user.get("age", 25))
    level = user.get("fitnessLevel", "Beginner")

    plans = {
        "Weight Loss": [
            {"exercise": "Jumping Jacks", "sets": 4, "reps": 30},
            {"exercise": "Squats", "sets": 4, "reps": 20},
            {"exercise": "Plank", "sets": 3, "reps": 60},
        ],
        "Muscle Gain": [
            {"exercise": "Pushups", "sets": 4, "reps": 15},
            {"exercise": "Lunges", "sets": 4, "reps": 14},
            {"exercise": "Plank", "sets": 4, "reps": 75},
        ],
        "Strength": [
            {"exercise": "Pushups", "sets": 5, "reps": 12},
            {"exercise": "Squats", "sets": 5, "reps": 15},
            {"exercise": "Lunges", "sets": 5, "reps": 12},
        ],
        "Beginner": [
            {"exercise": "Pushups", "sets": 3, "reps": 8},
            {"exercise": "Squats", "sets": 3, "reps": 10},
            {"exercise": "Plank", "sets": 3, "reps": 30},
        ],
        "Advanced": [
            {"exercise": "Pushups", "sets": 6, "reps": 20},
            {"exercise": "Squats", "sets": 6, "reps": 25},
            {"exercise": "Lunges", "sets": 6, "reps": 20},
        ],
    }

    recommendation = plans.get(goal, plans["Beginner"])

    if age > 45:
        recommendation = [{**x, "sets": max(2, x["sets"] - 1)} for x in recommendation]

    if len(history) > 10 or level == "Advanced":
        recommendation = [{**x, "reps": int(x["reps"] * 1.1)} for x in recommendation]

    return {
        "difficulty": level,
        "recommendation": recommendation,
        "smart_adjustment": "Applied based on age, goal and workout history.",
    }


def chat_reply(message: str):
    msg = (message or "").lower()
    if "weight loss" in msg:
        return "For weight loss, combine full-body HIIT 4x/week with a modest calorie deficit and daily walking."
    if "muscle" in msg:
        return "For muscle gain, aim for progressive overload, 8-12 reps, and adequate protein intake daily."
    if "beginner" in msg:
        return "As a beginner, focus on 3 full-body sessions weekly and prioritize form over intensity."
    if "posture" in msg or "back" in msg:
        return "Keep a neutral spine, brace your core, and avoid rounding your shoulders during reps."
    return "Stay consistent, track your workouts, and increase intensity gradually each week."
