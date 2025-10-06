import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

// Game Options

router.post('/', async (req: Request, res: Response) => {
const {  key, label } = req.body;
if (!key || !label) {
    return res.status(400).json({ error: 'Missing required fields: key and label' });
  }
    try{
        await db.collection('gameOptions').doc(key).set({
            label,
            timestamp: Date.now(),
        });
        res.status(201).json({
            message: 'Game option saved successfully',
            exerciseId: key,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export { router as gamesRouter };