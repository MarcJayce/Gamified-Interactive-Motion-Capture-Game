import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Exercise {
  key: string;
  label: string;
}

const ContentManagement = () => {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fetch`);
        setAvailableExercises(response.data.exercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) =>
      prev.find((ex) => ex.key === exercise.key)
        ? prev.filter((ex) => ex.key !== exercise.key)
        : [...prev, exercise]
    );
  };

  const saveApprovedExercises = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/gameConfig`, {
        selectedExercises,
      });
      console.log("Approved exercises saved:", response.data);
      alert("Exercises saved successfully!");
      navigate("/TeacherDashboard");
    } catch (error) {
      console.error("Error saving approved exercises:", error);
      alert("Error saving exercises.");
    }
  };

  const getExerciseEmoji = (key: string) => {
    switch (key) {
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

  return (
    <div className="w-full h-full bg-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🏋️ Content Management
          </h1>
          <p className="text-lg text-gray-600">
            Select which exercises students can access and play
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading exercises...</p>
            </div>
          </div>
        ) : availableExercises.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-40">🏋️</div>
              <p className="text-lg font-semibold text-gray-900">
                No exercises available
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {availableExercises.map((exercise) => (
                <label
                  key={exercise.key}
                  className="relative flex items-start p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedExercises.some(
                      (sel) => sel.key === exercise.key
                    )}
                    onChange={() => toggleExercise(exercise)}
                    className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {getExerciseEmoji(exercise.key)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {exercise.label}
                      </span>
                    </div>
                  </div>
                  {selectedExercises.some((sel) => sel.key === exercise.key) && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </label>
              ))}
            </div>

            {selectedExercises.length > 0 && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  ✓ {selectedExercises.length} exercise
                  {selectedExercises.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/TeacherDashboard")}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveApprovedExercises}
                disabled={selectedExercises.length === 0}
                className={`px-6 py-3 text-sm font-semibold text-white rounded-lg transition-colors ${
                  selectedExercises.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Save Exercises
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;
