import { Routes, Route, Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ContentManagement from "../Components/ContentManagement"; 
import AccountsManagement from "../Components/AccountsManagement";
import StudentSessions from "../Components/Gradebook";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed: " + (error as Error).message);
    }
  };

  const getActiveTab = () => {
    if (location.pathname.includes("/accounts")) return "accounts";
    if (location.pathname.includes("/exercises")) return "exercises";
    if (location.pathname.includes("/gradebook")) return "gradebook";
    return "home";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-screen w-screen bg-white">
      {/* Header */}
      <header className="w-full bg-indigo-900 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍🏫</span>
            <span className="text-3xl font-bold text-white">
              Teacher Dashboard
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              to="/TeacherDashboard"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "home"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "!text-white hover:bg-gray-200"
              }`}
            >
              Home
            </Link>
            <Link
              to="/TeacherDashboard/accounts"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "accounts"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "!text-white hover:bg-gray-200"
              }`}
            >
              👥 Accounts
            </Link>
            <Link
              to="/TeacherDashboard/exercises"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "exercises"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "!text-white hover:bg-gray-200"
              }`}
            >
              🏋️ Content
            </Link>
            <Link
              to="/TeacherDashboard/gradebook"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "gradebook"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "!text-white hover:bg-gray-200"
              }`}
            >
              📊 Gradebook
            </Link>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 ml-4 text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content - Takes remaining space */}
      <main className="flex-1 w-full bg-white overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              <div className="w-full h-full flex flex-col items-center justify-center px-6 py-8">
                <div className="text-center">
                  <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Welcome Back! 👋
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Manage your classroom and track student progress
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
                    <Link
                      to="/TeacherDashboard/accounts"
                      className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="text-5xl mb-4">👥</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Manage Accounts
                      </h3>
                      <p className="text-gray-600">manage student accounts</p>
                    </Link>
                    <Link
                      to="/TeacherDashboard/exercises"
                      className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-8 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="text-5xl mb-4">🏋️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Content
                      </h3>
                      <p className="text-gray-600">manage exercises</p>
                    </Link>
                    <Link
                      to="/TeacherDashboard/gradebook"
                      className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="text-5xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Gradebook
                      </h3>
                      <p className="text-gray-600">
                        View student progress and scores
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/accounts" element={<AccountsManagement />} />
          <Route path="/exercises" element={<ContentManagement />} />
          <Route path="/gradebook" element={<StudentSessions />} />
        </Routes>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-950/70 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>

            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 text-lg font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors mb-4"
            >
              🚪 Logout
            </button>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-6 py-4 text-lg font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
