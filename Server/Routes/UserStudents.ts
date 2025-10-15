import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';

const router = Router();
const db = admin.firestore();

router.get('/', async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection("users").where("role", "==", "student").get();
        const students = snapshot.docs.map(doc => ({
            key: doc.id, 
            ...doc.data(), 
        }));
        res.json({ students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students" });
    }

});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const userRef = db.collection('users').doc(id);
    await userRef.update({ name, email, role });
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.patch('/:id/disable', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const userRef = db.collection('users').doc(id);
    await userRef.update({ active });
    res.json({ message: `Student ${active ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ error: 'Failed to update active status' });
  }
});


export { router as userStudentsRouter };    