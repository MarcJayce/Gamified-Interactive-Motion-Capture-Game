import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Student {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface GameSession {
  userID: string;
  exerciseKey: string;
  difficulty: string;
  repsCount: number;
  score: number;
  timeLimit: number;
  studentEmail: string;
  studentName: string;
}

const StudentSessions: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/userStudents`)
      .then((res) => setStudents(res.data.students))
      .catch((err) => console.error("Failed to fetch students:", err));
  }, []);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    setShowModal(true);
    axios
      .get(`${API_BASE_URL}/gameSession/${student.email}`)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to fetch sessions:", err))
      .finally(() => setLoading(false));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setSessions([]);
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  const getExerciseEmoji = (key: string) => {
    switch (key.toLowerCase()) {
      case "squat":
        return "🦵";
      case "pushup":
        return "💪";
      case "lunge":
        return "🏃";
      default:
        return "🏋️";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-50 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full h-full bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📊 Gradebook
          </h1>
          <p className="text-lg text-gray-600">
            View and track student game sessions and performance
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {students.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-40">👥</div>
              <p className="text-lg font-semibold text-gray-900">
                No students found
              </p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-40">🔍</div>
              <p className="text-lg font-semibold text-gray-900">
                No students match your search
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  p-6">
              {filteredStudents.map((student) => (
                <button
                  key={student.uid}
                  onClick={() => handleStudentClick(student)}
                  className="text-left  bg-gray-50 border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                    <div className="text-3xl">👤</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {student.email}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded capitalize">
                        {student.role}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sessions Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  🎮 Game Sessions
                </h2>
                <p className="text-gray-600 mt-1">{selectedStudent.name}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-400">✕</span>
              </button>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading sessions...</p>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-40">🎮</div>
                    <p className="text-lg font-semibold text-gray-900">
                      No sessions found
                    </p>
                    <p className="text-gray-600 mt-2">
                      This student hasn't played any games yet
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session, index) => (
                    <div
                      key={index}
                      className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {getExerciseEmoji(session.exerciseKey)}
                            </span>
                            <span className="text-sm font-semibold text-gray-600">
                              Exercise
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 capitalize">
                            {session.exerciseKey}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-600 block mb-2">
                            Difficulty
                          </span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border capitalize ${getDifficultyColor(
                              session.difficulty
                            )}`}
                          >
                            {session.difficulty}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-600 block mb-2">
                            Score
                          </span>
                          <p className="text-2xl font-bold text-blue-600">
                            {session.score}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-600 block mb-2">
                            Reps Count
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {session.repsCount}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-600 block mb-2">
                            Time Limit
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {session.timeLimit}s
                          </p>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-gray-600 block mb-2">
                            User ID
                          </span>
                          <p className="text-sm text-gray-600 truncate">
                            {session.userID}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSessions;
