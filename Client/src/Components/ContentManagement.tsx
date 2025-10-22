import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Exercise {
  key: string;
  label: string;
}

const ContentManagement = () => {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get("/api/fetch");
        setAvailableExercises(response.data.exercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
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
      const response = await axios.post("/api/gameConfig", {
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

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold text-blue-300 mb-6 text-center">
        🧩 Exercise Selection
      </h2>

      <div className="space-y-4">
        {availableExercises.map((exercise) => (
          <label
            key={exercise.key}
            className="flex items-center bg-blue-800 p-4 rounded-lg border border-blue-500 shadow-sm hover:bg-blue-700 transition"
          >
            <input
              type="checkbox"
              checked={selectedExercises.some(
                (sel) => sel.key === exercise.key
              )}
              onChange={() => toggleExercise(exercise)}
              className="mr-3 accent-blue-400 w-5 h-5"
            />
            <span className="text-white text-lg">{exercise.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={saveApprovedExercises}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Save
        </button>
        <button
          onClick={() => navigate("/TeacherDashboard")}
          className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ContentManagement;
