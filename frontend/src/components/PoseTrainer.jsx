import { useEffect, useRef, useState } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { aiApiClient } from "../services/api";

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const PoseTrainer = ({ onRepUpdate, onExerciseChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(0);
  const sendingRef = useRef(false);
  const sessionIdRef = useRef(createSessionId());
  const exerciseRef = useRef("Pushups");

  const [exercise, setExercise] = useState("Pushups");
  const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(0);
  const [warnings, setWarnings] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    exerciseRef.current = exercise;
  }, [exercise]);

  const resetTrackingState = () => {
    frameRef.current = 0;
    sendingRef.current = false;
    sessionIdRef.current = createSessionId();
    setReps(0);
    setWarnings([]);
    setStatus("idle");
  };

  const cleanup = () => {
    sendingRef.current = false;
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (poseRef.current) {
      try {
        poseRef.current.close?.();
      } catch (closeError) {
        console.warn("Failed to close pose instance", closeError);
      }
      poseRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const startCamera = async () => {
    try {
      if (running) return;
      setError("");
      resetTrackingState();

      poseRef.current = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      poseRef.current.onResults(async (results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#06b6d4",
            lineWidth: 3
          });
          drawLandmarks(ctx, results.poseLandmarks, {
            color: "#4f46e5",
            lineWidth: 2,
            radius: 3
          });

          frameRef.current += 1;
          if (frameRef.current % 4 === 0 && !sendingRef.current) {
            sendingRef.current = true;
            try {
              const payload = {
                session_id: sessionIdRef.current,
                exercise_hint: exerciseRef.current,
                landmarks: results.poseLandmarks.map((lm) => ({
                  x: lm.x,
                  y: lm.y,
                  z: lm.z,
                  visibility: lm.visibility
                }))
              };

              const { data } = await aiApiClient.pose(payload);
              setReps(data.reps || 0);
              setStatus(data.posture?.status || "idle");
              setWarnings(data.posture?.warnings || []);
              onRepUpdate?.(data);
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Pose API error");
            } finally {
              sendingRef.current = false;
            }
          }
        }

        ctx.restore();
      });

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await cameraRef.current.start();
      setRunning(true);
    } catch (cameraError) {
      setError(cameraError.message || "Could not access camera");
      setRunning(false);
      cleanup();
    }
  };

  const stopCamera = () => {
    cleanup();
    setRunning(false);
  };

  const handleExerciseChange = (value) => {
    setExercise(value);
    resetTrackingState();
    onExerciseChange?.(value);
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">AI Pose Detection</h3>
        <select
          value={exercise}
          onChange={(e) => handleExerciseChange(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        >
          <option>Pushups</option>
          <option>Squats</option>
          <option>Lunges</option>
          <option>Plank</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
          <video ref={videoRef} className="hidden" playsInline />
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <p className="text-xs text-slate-400">Exercise</p>
            <p className="text-xl font-bold text-white">{exercise}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <p className="text-xs text-slate-400">Real-time Counter</p>
            <p className="text-3xl font-bold text-cyan-300">{reps} reps</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <p className="text-xs text-slate-400">Posture</p>
            <p className={`text-sm font-semibold ${status === "correct" ? "text-emerald-400" : "text-amber-300"}`}>
              {status === "correct" ? "Correct posture" : "Needs correction"}
            </p>
            {warnings.map((warning, index) => (
              <p key={`${warning}-${index}`} className="mt-1 text-xs text-rose-300">
                {warning}
              </p>
            ))}
          </div>
          <div className="flex gap-2">
            {!running ? (
              <button type="button" onClick={startCamera} className="gradient-btn w-full rounded-lg px-4 py-2 text-sm font-semibold text-white">
                Start Camera
              </button>
            ) : (
              <button type="button" onClick={stopCamera} className="w-full rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                Stop
              </button>
            )}
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default PoseTrainer;
