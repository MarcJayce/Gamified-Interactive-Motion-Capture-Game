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

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4 text-blue-300">🎓 Student List</h1>
      <ul className="space-y-2 mb-6">
        {students.map((student) => (
          <li
            key={student.uid}
            className="cursor-pointer p-3 border border-blue-500 rounded hover:bg-blue-700 bg-blue-600 text-white transition"
            onClick={() => handleStudentClick(student)}
          >
            {student.name} ({student.email})
          </li>
        ))}
      </ul>

      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-blue-900 text-white p-6 rounded-lg max-w-4xl w-full shadow-xl overflow-y-auto max-h-[80vh] border border-blue-400">
            <div className="flex justify-between items-center mb-4 border-b border-blue-500 pb-2">
              <h2 className="text-xl font-semibold text-blue-200">
                🎮 Game Sessions for {selectedStudent.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-blue-300 hover:text-white font-bold text-lg"
              >
                ✖
              </button>
            </div>

            {loading ? (
              <p className="text-blue-200">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-blue-200">No sessions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className="border border-blue-500 p-4 rounded bg-blue-800 shadow-sm"
                  >
                    <p>
                      <strong>Exercise:</strong> {session.exerciseKey}
                    </p>
                    <p>
                      <strong>Difficulty:</strong> {session.difficulty}
                    </p>
                    <p>
                      <strong>Reps Count:</strong> {session.repsCount}
                    </p>
                    <p>
                      <strong>Time Limit:</strong> {session.timeLimit}
                    </p>
                    <p>
                      <strong>Score:</strong> {session.score}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSessions;
