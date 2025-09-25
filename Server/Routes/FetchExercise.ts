import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

router.get('/', async (req: Request, res: Response) => {
try {
    const snapshot = await db.collection("gameOptions").get();

    const exercises = snapshot.docs.map(doc => ({
      key: doc.id, 
      ...doc.data(), 
    }));

    res.json({ exercises });
  } catch (error) {
    console.error("Error fetching gameOptions:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

export { router as fetchExerciseRouter };