import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Page-Css/StudentDashboard.css";

const exerciseOptions = [
  "squat", "pushup", "jumpingjack", "lunge", "plank",
  "armraise", "shoulderpress", "situp", "crunch",
  "warriorpose", "treepose", "downwarddog",
];  

const exerciseLabels: { [key: string]: string } = {
  squat: "Squat",
  pushup: "Push-Up",
  jumpingjack: "Jumping Jack",
  lunge: "Lunge",
  plank: "Plank",
  armraise: "Arm Raise",
  shoulderpress: "Shoulder Press",
  situp: "Sit-Up",
  crunch: "Crunch",
  warriorpose: "Warrior Pose",
  treepose: "Tree Pose",
  downwarddog: "Downward Dog",
};

const exerciseDescriptions: { [key: string]: string } = {
  squat: "Perform squats and let the AI count your reps.",
  pushup: "Do push-ups while the system tracks your form.",
  jumpingjack: "Jump and stretch, AI counts your jumping jacks.",
  lunge: "Alternate lunges, tracked for accuracy.",
  plank: "Hold a plank position, timer-based challenge.",
  armraise: "Raise your arms, AI detects correct movement.",
  shoulderpress: "Simulate shoulder presses, get real-time feedback.",
  situp: "Do sit-ups, AI counts each rep.",
  crunch: "Perform crunches, tracked for proper form.",
  warriorpose: "Hold the Warrior Yoga pose, AI checks your posture.",
  treepose: "Balance in Tree pose, posture detection.",
  downwarddog: "Yoga Downward Dog, AI guides your form.",
};

interface StudentScore {
  id: number;
  name: string;
  scores: {
    [exercise: string]: number; 
  };
}

const StudentDashboard: React.FC = () => {
  const [tab, setTab] = useState<"activity" | "student">("activity");
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch student scores 
  useEffect(() => {
    if (tab === "student") {
      setLoading(true);
      // API endpoint
      fetch("")
        .then((res) => res.json())
        .then((data) => {
          setStudents(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching scores:", err);
          setLoading(false);
        });
    }
  }, [tab]);

  return (
    <div className="student-dashboard">
      <header className="student-dashboard-header">
        <div className="student-dashboard-logo">🏃‍♂️</div>
        <span className="student-dashboard-title">DASHBOARD</span>
        <nav className="student-dashboard-tabs">
          <button
            className={tab === "activity" ? "active" : ""}
            onClick={() => setTab("activity")}
          >
            ACTIVITY
          </button>
          <button
            className={tab === "student" ? "active" : ""}
            onClick={() => setTab("student")}
          >
            Student Data
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="student-dashboard-main">
        {tab === "activity" ? (
          <>
            <div className="student-dashboard-activities">
              {exerciseOptions.map((ex) => (
                <div key={ex} className="student-dashboard-card">
                  <div className="student-dashboard-icon">🎮</div>
                  <div className="student-dashboard-name">{exerciseLabels[ex]}</div>
                  <div className="student-dashboard-desc">{exerciseDescriptions[ex]}</div>
                </div>
              ))}
            </div>

            <div className="student-dashboard-actions">
              <button
                className="student-dashboard-start-btn"
                onClick={() => navigate("/GameScreen")}
              >
                Start Game
              </button>
            </div>
          </>
        ) : (
          // Student Data
          <div className="student-dashboard-student">
            {loading ? (
              <p>Loading student data...</p>
            ) : (
              <table className="student-dashboard-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    {exerciseOptions.map((ex) => (
                      <th key={ex}>{exerciseLabels[ex]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      {exerciseOptions.map((ex) => (
                        <td key={ex}>{student.scores[ex] ?? "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;


