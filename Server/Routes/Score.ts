import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

// Upload Score
router.post('/', async (req: Request, res: Response) => {
  const { uid, score } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    const newSession = await db.collection('gameSessions').add({
      uid,
      score,
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

export { router as scoreRouter };
