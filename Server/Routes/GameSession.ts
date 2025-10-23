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
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;


  try {
    const snapshot = await db
      .collection('gameSessions')
      .where('userId', '==', userId)
      // .orderBy('timestamp', 'desc')
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
// Get All Game Sessions
router.get('/all', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('gameSessions').get();
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
