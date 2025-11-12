import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Page-Css/StudentDashboard.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
import ProfilePage from "./ProfilePage";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the import based on your project structure

interface StudentScore {
  id: string;
  name: string;
  scores: Record<string, number>;
}

interface Exercise {
  key: string;
  label: string;
}

type TabType = "profile" | "activity" | "leaderboard";

const StudentDashboard: React.FC = () => {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [tab, setTab] = useState<TabType>("profile");
  const [showSettings, setShowSettings] = useState(false);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Exercises list

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
    if (tab === "leaderboard") {
      setLoading(true);

      const fetchLeaderboard = async () => {
        try {
          const studentsResponse = await fetch(`${API_BASE_URL}/userStudents`);
          const studentsData = await studentsResponse.json();
          const allStudents = studentsData.students;

          // Fetch sessions for each student
          const leaderboardPromises = allStudents.map(async (student: any) => {
            try {
              const sessionsResponse = await fetch(
                `${API_BASE_URL}/gameSession/${student.email}`
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
              console.error(`Failed to fetch sessions for ${student.email}:`, err);

              return {
                id: student.uid,
                name: student.name,
                scores: {},
              };
            }
          });

          const leaderboardData = await Promise.all(leaderboardPromises);

          const studentsWithScores = leaderboardData.filter((student) =>
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed: " + (error as Error).message);
    }
  };

  return (
    <div className="student-dashboard bg-white">
      {/* header and tabs */}
      <header className="w-full bg-indigo-900 border-b border-indigo-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃‍♂️</span>
            <span className="text-2xl font-bold text-white">
              Student Dashboard
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === "profile"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => setTab("profile")}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === "activity"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => setTab("activity")}
            >
              Activity
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === "leaderboard"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => setTab("leaderboard")}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 ml-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </nav>
        </div>
      </header>

      <main className="student-dashboard-main bg-white">
        {/* PROFILE TAB */}
        {tab === "profile" && <ProfilePage />}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <div className="w-full bg-white px-4 py-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                📋 Activity
              </h2>
              <p className="text-gray-600 mb-8">
                Choose an exercise to start playing and track your progress.
              </p>
            </div>

            {exerciseList && exerciseList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {exerciseList.map((ex) => (
                    <div
                      key={ex.key}
                      className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow hover:border-blue-200 cursor-pointer group"
                    >
                      <div className="flex flex-col h-full">
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                          {ex.key === "squat"
                            ? "🦵"
                            : ex.key === "pushup"
                            ? "💪"
                            : ex.key === "lunge"
                            ? "🏃"
                            : "🎮"}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">
                          {exerciseLabels[ex.key] || ex.key}
                        </h3>
                        <p className="text-sm text-gray-600 flex-1">
                          {exerciseDescriptions[ex.key] ||
                            "No description available."}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Ready to play
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/GameScreen")}
                    className="px-8 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                  >
                    Start Game →
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-40">🎮</div>
                  <p className="text-lg font-semibold text-gray-900">
                    No exercises available
                  </p>
                  <p className="text-gray-500 mt-2">
                    Check back soon for new activities.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (
          <div className="w-full bg-white px-4 py-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                🏆 Leaderboard
              </h2>
              <div className="w-64">
                <label
                  htmlFor="session-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Filter by Exercise
                </label>
                <select
                  id="session-select"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading leaderboard...</p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-40">📊</div>
                  <p className="text-lg font-semibold text-gray-900">
                    No scores available yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Student
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        {selectedSession === "all" ? "Total Score" : "Score"}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        {selectedSession === "all" ? "Exercises" : "Exercise"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLeaderboardData().map((student, index) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : `#${index + 1}`}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600 text-lg">
                          {student.totalScore}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {selectedSession === "all"
                            ? student.sessions
                            : exerciseLabels[selectedSession] ||
                              selectedSession}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0  bg-gray-950/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors mb-4"
            >
              Logout
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;



