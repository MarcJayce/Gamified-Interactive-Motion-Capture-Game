import express from "express";
import { saveApprovedExercises } from "./saveApprovedExercises";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const selectedExercises = req.body.selectedExercises;
    await saveApprovedExercises(selectedExercises);
    res.status(200).json({ message: "Approved exercises saved." });
  } catch (error) {
    console.error("Error saving approved exercises:", error);
    res.status(500).json({ error: "Failed to save approved exercises." });
  }
});

export { router as gameConfigRouter };
