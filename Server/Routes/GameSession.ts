import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

// Upload Game Session Data
router.post('/', async (req: Request, res: Response) => {
  const { uid,Exercise, Difficulty, TimeLimit,TotalReps, Score } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  try {
    const newSession = await db.collection('gameSessions').add({
      uid,
      Exercise,
      Difficulty,
      TimeLimit,
      TotalReps,
      Score,
      timestamp: Date.now(),
    });

    res.status(201).json({
      message: 'Game session saved successfully',
      sessionId: newSession.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Game Sessions for a Specific User
router.get('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: 'UID is required' });
  }

  try {
    const snapshot = await db
      .collection('gameSessions')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .get();

    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as gameSessionRouter };
