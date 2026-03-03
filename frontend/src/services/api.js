import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8000";

const localKey = "aifit_auth";
const sessionKey = "aifit_auth_session";

const parseAuthPayload = (storage, key) => {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.token === "string") {
      return parsed;
    }
  } catch (error) {
    // Remove invalid payloads to prevent startup crashes from corrupted storage.
    storage.removeItem(key);
  }

  return null;
};

export const getStoredAuth = () => {
  const local = parseAuthPayload(localStorage, localKey);
  if (local) return local;
  return parseAuthPayload(sessionStorage, sessionKey);
};

export const storeAuth = (payload, rememberMe) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;
  other.removeItem(rememberMe ? sessionKey : localKey);
  target.setItem(rememberMe ? localKey : sessionKey, JSON.stringify(payload));
};

export const clearAuth = () => {
  localStorage.removeItem(localKey);
  sessionStorage.removeItem(sessionKey);
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

const aiApi = axios.create({
  baseURL: AI_URL,
  timeout: 10000
});

export const authApi = {
  signup: (data) => api.post("/signup", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
  forgotPassword: (email) => api.post("/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/reset-password", { token, password })
};

export const userApi = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile", data),
  changePassword: (data) => api.put("/change-password", data),
  deleteAccount: () => api.delete("/account"),
  getStats: () => api.get("/stats"),
  getAchievements: () => api.get("/achievements"),
  getReminders: () => api.get("/reminders"),
  saveReminder: (data) => api.post("/reminders", data)
};

export const workoutApi = {
  createWorkout: (data) => api.post("/workout", data),
  getWorkouts: (params = {}) => api.get("/workouts", { params }),
  getAnalytics: () => api.get("/workouts/analytics")
};

export const aiApiClient = {
  recommend: (data) => api.post("/recommend", data),
  chatbot: (message) => api.post("/chatbot", { message }),
  pose: (data) => aiApi.post("/pose", data)
};

export const leaderboardApi = {
  getLeaderboard: () => api.get("/leaderboard")
};

export default api;
