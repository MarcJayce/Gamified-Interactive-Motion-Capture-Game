import { useEffect, useState } from "react";
import axios from "axios";


interface Exercise {
  key: string;
  label: string;
}


const ContentManagement = () => {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get("http://localhost:3001/fetch");
        console.log("Fetched:", response.data);
        setAvailableExercises(response.data.exercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, []);  

  function toggleExercise(exercise: Exercise) {
    setSelectedExercises((prev) =>
      prev.find((ex) => ex.key === exercise.key)
        ? prev.filter((ex) => ex.key !== exercise.key)
        : [...prev, exercise]
    );
  }
  

  const saveApprovedExercises = async () => {
    try {
        const response = await axios.post("http://localhost:3001/gameConfig", {
          selectedExercises,
        });
        console.log("Approved exercises saved:", response.data);
    } catch (error) {
        console.error("Error saving approved exercises:", error);
    }
  }
  return (
    <div>
      <h2>Exercises</h2>
      {availableExercises.map((exercise) => (
        <div key={exercise.key}>
          <input
            type="checkbox"
            checked={selectedExercises.some((sel) => sel.key === exercise.key)}
            onChange={() => toggleExercise(exercise)}
          />
          <label>{exercise.label}</label>
        </div>
      ))}
      <button onClick={saveApprovedExercises}>Save</button>
    </div>
  );
};

export default ContentManagement;