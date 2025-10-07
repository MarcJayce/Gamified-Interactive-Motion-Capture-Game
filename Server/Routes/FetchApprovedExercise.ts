import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

router.get('/', async (req: Request, res: Response) => {
    try {
    const docRef = db.collection("gameConfig").doc("approvedExercises");
    const snapshot = await docRef.get();

    const data = snapshot.data();
    res.json({ approvedIds: data?.approvedIds || [] });
  } catch (error) {
    console.error("Error fetching approved exercises:", error);
    res.status(500).json({ error: "Failed to fetch approved exercises" });
  }
});

export { router as fetchApprovedExerciseRouter };