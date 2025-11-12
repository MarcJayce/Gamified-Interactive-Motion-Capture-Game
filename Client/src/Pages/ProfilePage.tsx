import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
import "../Page-Css/ProfilePage.css";

type UserProfile = {
  name: string;
  email: string;
  weight: number;
  height: number;
};

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

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("");
  // New: separate first/last name for edit form
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const loadSessions = useCallback(async (email: string) => {
    setLoadingSessions(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/gameSession/${email}`);
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadProfile = useCallback(
    async (user: User) => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const userProfile: UserProfile = {
            name: data.name ?? "",
            email: data.email ?? user.email ?? "",
            weight: Number(data.weight ?? 0),
            height: Number(data.height ?? 0),
          };
          setProfile(userProfile);
          setEditedProfile(userProfile);
          // split name into first/last for edit inputs
          const parts = (userProfile.name || "").trim().split(" ");
          setFirstName(parts.shift() ?? "");
          setLastName(parts.join(" ") ?? "");
          loadSessions(userProfile.email);
        } else {
          try {
            const res = await axios.get(`${API_BASE_URL}/userStudents/${user.uid}`);
            const d = res.data;
            const userProfile: UserProfile = {
              name: d.name ?? "",
              email: d.email ?? user.email ?? "",
              weight: Number(d.weight ?? 0),
              height: Number(d.height ?? 0),
            };
            setProfile(userProfile);
            setEditedProfile(userProfile);
            const parts = (userProfile.name || "").trim().split(" ");
            setFirstName(parts.shift() ?? "");
            setLastName(parts.join(" ") ?? "");
            loadSessions(userProfile.email);
          } catch (err) {
            console.warn("Failed to fetch profile from backend:", err);
            setProfile({
              name: user.displayName ?? "",
              email: user.email ?? "",
              weight: 0,
              height: 0,
            });
            setEditedProfile({
              name: user.displayName ?? "",
              email: user.email ?? "",
              weight: 0,
              height: 0,
            });
            const parts = ((user.displayName ?? "")).trim().split(" ");
            setFirstName(parts.shift() ?? "");
            setLastName(parts.join(" ") ?? "");
            if (user.email) loadSessions(user.email);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    },
    [loadSessions]
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setAuthLoading(false);
        loadProfile(user);
      } else {
        setIsAuthenticated(false);
        setAuthLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, loadProfile]);

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      setEditedProfile(profile);
      const parts = (profile.name || "").trim().split(" ");
      setFirstName(parts.shift() ?? "");
      setLastName(parts.join(" ") ?? "");
    }
    setIsEditing((prev) => !prev);
    setSaveMessage("");
  };

  const handleInputChange = (
    field: keyof UserProfile,
    value: string | number
  ) => {
    if (!editedProfile) return;
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    try {
      const user = auth.currentUser;
      if (user) {
        // ensure name combines first and last before save
        const combinedName = `${firstName} ${lastName}`.trim();
        const profileToSave = {
          ...editedProfile,
          name: combinedName || editedProfile.name || "Unnamed User",
        };

        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          name: profileToSave.name,
          weight: Number(profileToSave.weight),
          height: Number(profileToSave.height),
          email: profileToSave.email,
        });

        try {
          await axios.put(`${API_BASE_URL}/userStudents/${user.uid}`, {
            name: profileToSave.name,
            email: profileToSave.email,
            weight: Number(editedProfile.weight),
            height: Number(editedProfile.height),
          });
        } catch (apiError) {
          console.warn("Backend API update failed:", apiError);
        }

        setProfile(profileToSave);
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("No authenticated user.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveMessage("Error updating profile. Please try again.");
    }
  };

  const calculateAverage = () => {
    if (sessions.length === 0) return "N/A";
    const total = sessions.reduce(
      (sum: number, s: GameSession) => sum + s.score,
      0
    );
    return (total / sessions.length).toFixed(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 overflow-hidden">
      <div className="w-full px-4 py-6 h-full">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-stretch">
            {/* Left Column - Profile & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-20 -translate-y-20"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-purple-300/50 mb-4">
                    {profile ? getInitials(profile.name) : "?"}
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                    {profile?.name || "Loading..."}
                  </h1>
                  <p className="text-gray-500 text-sm mb-6">{profile?.email}</p>

                  {saveMessage && (
                    <div
                      className={`p-3 rounded-xl mb-4 text-sm font-medium ${
                        saveMessage.includes("Error")
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {saveMessage}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="profile-edit-form">
                      <div className="form-group grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (editedProfile) setEditedProfile({ ...editedProfile, name: `${e.target.value} ${lastName}`.trim() });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (editedProfile) setEditedProfile({ ...editedProfile, name: `${firstName} ${e.target.value}`.trim() });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            value={editedProfile?.weight || 0}
                            onChange={(e) =>
                              handleInputChange(
                                "weight",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            value={editedProfile?.height || 0}
                            onChange={(e) =>
                              handleInputChange(
                                "height",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.1"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-black"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Weight
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {profile?.weight || 0}
                            <span className="text-sm text-gray-400 ml-1">kg</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            Height
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {profile?.height || 0}
                            <span className="text-sm text-gray-400 ml-1">cm</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            BMI
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {profile && profile.weight > 0 && profile.height > 0
                              ? (
                                  profile.weight /
                                  Math.pow(profile.height / 100, 2)
                                ).toFixed(1)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleEditToggle}
                        className="w-full mt-6 bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">📊</div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Total Sessions
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {sessions.length}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">⭐</div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Average Score
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      sessions.length > 0 && parseFloat(calculateAverage()) >= 80
                        ? "text-green-500"
                        : sessions.length > 0 &&
                          parseFloat(calculateAverage()) >= 60
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    {calculateAverage()}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-3xl mb-3">🏆</div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    Highest Score
                  </p>
                  <p className="text-4xl font-bold text-green-500">
                    {sessions.length > 0
                      ? Math.max(...sessions.map((s) => s.score))
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Game Sessions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 shadow-sm h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                  Game Sessions History
                </h2>

                {loadingSessions ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading sessions...</p>
                    </div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl">
                    <div className="text-center p-12">
                      <div className="text-6xl mb-4 opacity-40">🎮</div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        No sessions yet
                      </p>
                      <p className="text-gray-500">
                        Start playing to track your progress!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 -mx-2 px-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {sessions.map((session, index) => {
                        const scoreColor =
                          session.score >= 80
                            ? "text-green-500 bg-green-50"
                            : session.score >= 60
                            ? "text-orange-500 bg-orange-50"
                            : "text-red-500 bg-red-50";

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all hover:-translate-y-1 cursor-default"
                          >
                            <div className="flex justify-between items-start mb-5">
                              <h3 className="text-base font-semibold text-gray-900 flex-1 pr-3">
                                {session.exerciseKey}
                              </h3>
                              <div
                                className={`px-3 py-1 rounded-full text-base font-bold ${scoreColor}`}
                              >
                                {session.score}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Difficulty
                                </span>
                                <span className="text-sm font-semibold text-gray-900 capitalize">
                                  {session.difficulty}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Reps
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {session.repsCount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  Time Limit
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {session.timeLimit}s
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
