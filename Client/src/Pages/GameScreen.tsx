import { useState, useEffect, useRef } from "react";
import "../Page-Css/GameScreen.css";
import axios from "axios";
import { auth } from "../firebase";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



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

  const repsRef = useRef(repsCounter);
  useEffect(() => { repsRef.current = repsCounter; }, [repsCounter]);

  // new refs/state for per-rep aggregation
  const lastRepCountRef = useRef<number>(0);
  const currentRepScoresRef = useRef<number[]>([]);
  const [repAverages, setRepAverages] = useState<number[]>([]);

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
      try {
        const data: PoseTrackerData =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        setPoseTrackerInfos(data);

        // update rep counter when PoseTracker sends it
        if (data.type === "counter" && typeof data.current_count === "number") {
          setRepsCounter(data.current_count);
        }

        // start session when posture ready
        if (data.type === "posture" && !sessionStarted && data.ready === true) {
          setSessionStarted(true);
        }

        // collect per-frame keypoint score and aggregate per-rep
        if (data.type === "keypoints" && Array.isArray(data.data)) {
          // compute frame score = average keypoint score scaled 0..100
          const scores = data.data.map((kp) => kp.score ?? 0);
          const frameAvg = scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
          const frameScore = Math.round(frameAvg * 100);

          const currentRepCount = repsRef.current;
          const lastRepCount = lastRepCountRef.current;

          // Only start accumulating once the tracker has produced counts (avoid pre-count spikes)
          if (currentRepCount === 0 && lastRepCount === 0) {
            // don't accumulate yet
          } else if (currentRepCount === lastRepCount) {
            // still collecting frames for the same rep
            currentRepScoresRef.current.push(frameScore);
          } else if (currentRepCount > lastRepCount) {
            // rep count incremented -> finalize previous rep (if any)
            if (currentRepScoresRef.current.length > 0) {
              const sum = currentRepScoresRef.current.reduce((s, v) => s + v, 0);
              const avg = Math.round(sum / currentRepScoresRef.current.length);
              setRepAverages((prev) => [...prev, avg]);
            }
            // reset and start collecting for the new rep
            currentRepScoresRef.current = [frameScore];
            lastRepCountRef.current = currentRepCount;
          } else {
            // unexpected change -> reset buffer for safety
            currentRepScoresRef.current = [frameScore];
            lastRepCountRef.current = currentRepCount;
          }

          // Build array of completed rep averages + in-progress rep
          const completed = repAverages.slice();
          if (currentRepScoresRef.current.length > 0) {
            const sumInProgress = currentRepScoresRef.current.reduce((s, v) => s + v, 0);
            const avgInProgress = Math.round(sumInProgress / currentRepScoresRef.current.length);
            completed.push(avgInProgress);
          }

          // compute session average if we have any per-rep data
          const sessionAvg = completed.length > 0 ? Math.round(completed.reduce((s, v) => s + v, 0) / completed.length) : null;

          // Difficulty multiplier: easy -> slightly easier, medium -> baseline, hard -> stricter
          const difficulty = selectedDifficulty ?? "medium";
          const difficultyMultiplier = difficulty === "easy" ? 1.05 : difficulty === "hard" ? 0.85 : 1.0;

          // Stability factor reduces score when too few reps are present (minReps => full weight)
          const minRepsForStableScore = 3;
          const stabilityFactor = Math.min(1, (repsRef.current || 0) / minRepsForStableScore);

          if (sessionAvg !== null) {
            let finalScore = Math.round(sessionAvg * difficultyMultiplier * stabilityFactor);
            finalScore = Math.max(0, Math.min(100, finalScore)); // clamp 0..100
            setComputedScore(finalScore);
          }
        }

        // finalize when PoseTracker indicates finished
        if (data.finished === true) {
          // finalize last in-progress rep
          if (currentRepScoresRef.current.length > 0) {
            const sum = currentRepScoresRef.current.reduce((s, v) => s + v, 0);
            const avg = Math.round(sum / currentRepScoresRef.current.length);
            setRepAverages((prev) => [...prev, avg]);
            currentRepScoresRef.current = [];
          }
          setSessionFinished(true);
        }
      } catch (err) {
        console.error("Message parsing error:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sessionStarted, repAverages, selectedDifficulty]);

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
    const fetchApprovedExercises = async () => {
      try {
      
        const configRes = await axios.get(`${API_BASE_URL}/fetchApproved`);
        const approvedIds: string[] = configRes.data?.approvedIds ?? [];

    
        const allRes = await axios.get(`${API_BASE_URL}/fetch`);
        const allExercises: Exercise[] = allRes.data?.exercises ?? [];


        const filtered = allExercises.filter((ex) =>
          approvedIds.includes(ex.key)
        );
        setExerciseList(filtered);
      } catch (error) {
        console.error("Failed to fetch approved exercises:", error);
      }
    };

    fetchApprovedExercises();
  }, []);

useEffect(() => {
  const handleUpload = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await axios.post(`${API_BASE_URL}/gameSession`, {
        uid: user.uid,
        Exercise: selectedExercise,
        Difficulty: selectedDifficulty,
        TimeLimit: selectedTimeLimit,
        TotalReps: repsCounter,
        Score: computedScore,
      });
      console.log("Session uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  if (sessionFinished) {
    handleUpload();
  }
}, [sessionFinished, selectedExercise, selectedDifficulty, selectedTimeLimit, repsCounter, computedScore]);

  return (
    <div className="container">
      {!selectedExercise || !selectedDifficulty || !selectedTimeLimit ? (
        <div className="selection">
          <h2>Choose Your Exercise</h2>
          {exerciseList && exerciseList.map((ex) => (
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
