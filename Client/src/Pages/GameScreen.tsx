import { useState, useEffect } from "react";
import "../Page-Css/GameScreen.css";
import axios from "axios";

const API_KEY = import.meta.env.VITE_POSETRACKER_KEY;
const POSETRACKER_API = import.meta.env.VITE_POSETRACKER_API;

type Keypoint = {
  name: string;
  x: number;
  y: number;
  score: number;
};

type PoseTrackerData = {
  type?: string;
  message?: string;
  direction?: string;
  ready?: boolean;
  requirements?: string[];
  current_count?: number;
  finished?: boolean;
  data?: Keypoint[];
};

interface Exercise {
  key: string;
  label: string;
}

const timeLimitOptions: { label: string; value: number }[] = [
  { label: "0:30", value: 30 },
  { label: "1:00", value: 60 },
  { label: "2:00", value: 120 },
];

const Gamescreen = () => {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState<number | null>(null);
  const [poseTrackerInfos, setPoseTrackerInfos] = useState<PoseTrackerData | null>(null);
  const [repsCounter, setRepsCounter] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [computedScore, setComputedScore] = useState<number | null>(null);

  const iframeUrl = `${POSETRACKER_API}?token=${API_KEY}&exercise=${selectedExercise}&difficulty=${selectedDifficulty}&width=${window.innerWidth}&height=${window.innerHeight}&isMobile=true&keypoints=true`;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && !sessionFinished) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (selectedTimeLimit && prev + 1 >= selectedTimeLimit) {
            setSessionFinished(true);
            clearInterval(interval);
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, sessionFinished, selectedTimeLimit]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("PoseTracker message:", event.data); // Debug log

      try {
        const data: PoseTrackerData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        setPoseTrackerInfos(data);

        if (data.type === "counter" && typeof data.current_count === "number") {
          setRepsCounter(data.current_count);
        }

        if (data.type === "posture" && !sessionStarted && data.ready === true) {
          setSessionStarted(true);
        }

        if (data.type === "keypoints" && Array.isArray(data.data)) {
          const scores = data.data.map((kp) => kp.score);
          const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
          const scaled = Math.round(avg * 100);
          setComputedScore(scaled);
        }

        if (data.finished === true) {
          setSessionFinished(true);
        }
      } catch (err) {
        console.error("Message parsing error:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sessionStarted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resetSession = () => {
    setSelectedExercise(null);
    setSelectedDifficulty(null);
    setSelectedTimeLimit(null);
    setPoseTrackerInfos(null);
    setRepsCounter(0);
    setTimer(0);
    setSessionStarted(false);
    setSessionFinished(false);
    setComputedScore(null);
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get("http://localhost:3001/fetch");
        console.log("Fetched:", response.data);
        setExerciseList(response.data.exercises);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  return (
    <div className="container">
      {!selectedExercise || !selectedDifficulty || !selectedTimeLimit ? (
        <div className="selection">
          <h2>Choose Your Exercise</h2>
          {Array.isArray(exerciseList) &&
            exerciseList.map((ex) => (
              <button
                key={ex.key}
                className={selectedExercise === ex.key ? "selected" : "option"}
                onClick={() => setSelectedExercise(ex.key)}
              >
                {ex.label}
              </button>
            ))}

          <h2>Choose Difficulty</h2>
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              className={selectedDifficulty === level ? "selected" : "option"}
              onClick={() => setSelectedDifficulty(level)}
            >
              {level}
            </button>
          ))}

          <h2>Choose Time Limit</h2>
          {timeLimitOptions.map(({ label, value }) => (
            <button
              key={value}
              className={selectedTimeLimit === value ? "selected" : "option"}
              onClick={() => setSelectedTimeLimit(value)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : sessionFinished ? (
        <div className="summary">
          <h2>🏁 Session Complete!</h2>
          <p>Exercise: {exerciseList.find((ex) => ex.key === selectedExercise)?.label || "Unknown"}</p>
          <p>Difficulty: {selectedDifficulty}</p>
          <p>Time Limit: {formatTime(selectedTimeLimit || 0)}</p>
          <p>Total Reps: {repsCounter}</p>
          <p>Score: {computedScore !== null ? `${computedScore}/100` : "N/A"}</p>
          <p>
            {computedScore !== null
              ? computedScore > 85
                ? "🌟 Excellent form!"
                : computedScore > 65
                ? "👍 Good effort!"
                : "🛠️ Needs improvement"
              : ""}
          </p>
          <button className="start" onClick={resetSession}>
            Restart
          </button>
        </div>
      ) : (
        <>
          <iframe
            src={iframeUrl}
            title="PoseTracker"
            className="iframe"
            allow="camera; microphone"
          />
          <div className="overlay">
            {!sessionStarted ? (
              <>
                <p>🧍 Waiting for correct posture...</p>
                <p>{poseTrackerInfos?.message || "Adjust your position to be detected"}</p>
                <p>Expected Direction: {poseTrackerInfos?.direction || "Unknown"}</p>
              </>
            ) : (
              <>
                <p>Status: AI Running</p>
                <p>Counter: {repsCounter}</p>
                <p>
                  ⏱️ Timer: {formatTime(timer)} / {formatTime(selectedTimeLimit || 0)}
                </p>
                <p>Live Score: {computedScore !== null ? `${computedScore}/100` : "Calculating..."}</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Gamescreen;
