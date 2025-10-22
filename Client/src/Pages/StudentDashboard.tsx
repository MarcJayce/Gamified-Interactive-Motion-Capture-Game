import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../Page-Css/StudentDashboard.css";

interface StudentScore {
  id: string;
  name: string;
  scores: Record<string, number>;
}

interface UserProfile {
  name: string;
  email: string;
  weight: number;
  height: number;
}

type TabType = "profile" | "activity" | "leaderboard";

const StudentDashboard: React.FC = () => {
  const [tab, setTab] = useState<TabType>("profile");
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const navigate = useNavigate();

  // Exercises list
  const exerciseOptions: string[] = [
    "squat", "pushup", "jumpingjack", "lunge", "plank",
    "armraise", "shoulderpress", "situp", "crunch",
    "warriorpose", "treepose", "downwarddog",
  ];

  const exerciseLabels: Record<string, string> = {
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

  const exerciseDescriptions: Record<string, string> = {
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);
          setEditedProfile(profileData);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (tab === "leaderboard") {
      setLoading(true);
      
      const fetchLeaderboard = async () => {
        try {
          const studentsResponse = await fetch("http://localhost:3001/userStudents");
          const studentsData = await studentsResponse.json();
          const allStudents = studentsData.students;

          // Fetch sessions for each student 
          const leaderboardPromises = allStudents.map(async (student: any) => {
            try {
              const sessionsResponse = await fetch(
                `http://localhost:3001/gameSession/${student.email}`
              );
              const sessions = await sessionsResponse.json();

              const scoresByExercise: Record<string, number> = {};
              sessions.forEach((session: any) => {
                if (!scoresByExercise[session.exerciseKey]) {
                  scoresByExercise[session.exerciseKey] = 0;
                }
                scoresByExercise[session.exerciseKey] += session.score;
              });

              return {
                id: student.uid,
                name: student.name,
                scores: scoresByExercise,
              };
            } catch (err) {

              return {
                id: student.uid,
                name: student.name,
                scores: {},
              };
            }
          });

          const leaderboardData = await Promise.all(leaderboardPromises);
          
          const studentsWithScores = leaderboardData.filter(student => 
            Object.keys(student.scores).length > 0
          );
          
          setStudents(studentsWithScores);

          const exercises = new Set<string>();
          studentsWithScores.forEach((student) => {
            Object.keys(student.scores || {}).forEach((exercise) => {
              exercises.add(exercise);
            });
          });
          setAvailableSessions(Array.from(exercises).sort());
        } catch (err) {
          console.error("Error fetching leaderboard:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchLeaderboard();
    }
  }, [tab]);

  // Handle profile edit
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile);
    }
    setIsEditing(!isEditing);
    setSaveMessage("");
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          name: editedProfile.name,
          weight: Number(editedProfile.weight),
          height: Number(editedProfile.height),
        });

        try {
          await fetch(`http://localhost:3001/userStudents/${user.uid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: editedProfile.name,
              email: editedProfile.email,
              weight: Number(editedProfile.weight),
              height: Number(editedProfile.height),
            }),
          });
        } catch (apiError) {
          console.warn("Backend API update failed:", apiError);
        }

        setProfile(editedProfile);
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage("Error updating profile. Please try again.");
    }
  };

  // get filtered leaderboard data
  const getLeaderboardData = () => {
    if (selectedSession === "all") {
      return students
        .map((student) => {
          const scores = Object.values(student.scores || {});
          const totalScore = scores.reduce((a, b) => a + (b || 0), 0);
          const sessions = scores.filter((s) => s > 0).length;
          return { ...student, totalScore, sessions };
        })
        .sort((a, b) => b.totalScore - a.totalScore);
    } else {
      return students
        .map((student) => {
          const score = student.scores?.[selectedSession] || 0;
          return { ...student, totalScore: score, sessions: score > 0 ? 1 : 0 };
        })
        .filter((student) => student.totalScore > 0)
        .sort((a, b) => b.totalScore - a.totalScore);
    }
  };

  return (
    <div className="student-dashboard">
      {/* HEADER */}
      <header className="student-dashboard-header">
        <div className="student-dashboard-logo">🏃‍♂️</div>
        <span className="student-dashboard-title">STUDENT DASHBOARD</span>
        <nav className="student-dashboard-tabs">
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            PROFILE
          </button>
          <button
            className={tab === "activity" ? "active" : ""}
            onClick={() => setTab("activity")}
          >
            ACTIVITY
          </button>
          <button
            className={tab === "leaderboard" ? "active" : ""}
            onClick={() => setTab("leaderboard")}
          >
            LEADERBOARD
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="student-dashboard-main">
        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div className="student-dashboard-profile">
            {profile && editedProfile ? (
              <div className="profile-card">
                <h2>👤 Profile</h2>
                
                {saveMessage && (
                  <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                    {saveMessage}
                  </div>
                )}

                {isEditing ? (
                  <div className="profile-edit-form">
                    <div className="form-group">
                      <label><strong>Name:</strong></label>
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label><strong>Email:</strong></label>
                      <input
                        type="email"
                        value={editedProfile.email}
                        disabled
                        className="disabled-input"
                      />
                      <small>Email cannot be changed</small>
                    </div>
                    <div className="form-group">
                      <label><strong>Weight (kg):</strong></label>
                      <input
                        type="number"
                        value={editedProfile.weight}
                        onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="form-group">
                      <label><strong>Height (cm):</strong></label>
                      <input
                        type="number"
                        value={editedProfile.height}
                        onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="profile-actions">
                      <button className="btn-save" onClick={handleSaveProfile}>
                        Save Changes
                      </button>
                      <button className="btn-cancel" onClick={handleEditToggle}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-view">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Weight:</strong> {profile.weight} kg</p>
                    <p><strong>Height:</strong> {profile.height} cm</p>
                    <p>
                      <strong>BMI:</strong>{" "}
                      {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(2)}
                    </p>
                    <button className="btn-edit" onClick={handleEditToggle}>
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
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
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div className="student-dashboard-student">
            <div className="leaderboard-header">
              <h2>🏆 Leaderboard</h2>
              <div className="session-filter">
                <label htmlFor="session-select">Exercise: </label>
                <select
                  id="session-select"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                >
                  <option value="all">All Exercises</option>
                  {availableSessions.map((session) => (
                    <option key={session} value={session}>
                      {exerciseLabels[session] || session}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <p>Loading leaderboard...</p>
            ) : students.length === 0 ? (
              <p>No scores available yet.</p>
            ) : (
              <table className="student-dashboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>{selectedSession === "all" ? "Total Score" : "Score"}</th>
                    <th>{selectedSession === "all" ? "Exercises Completed" : "Exercise"}</th>
                  </tr>
                </thead>
                <tbody>
                  {getLeaderboardData().map((student, index) => (
                    <tr key={student.id}>
                      <td>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </td>
                      <td>{student.name}</td>
                      <td>{student.totalScore}</td>
                      <td>
                        {selectedSession === "all" 
                          ? student.sessions 
                          : exerciseLabels[selectedSession] || selectedSession}
                      </td>
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



