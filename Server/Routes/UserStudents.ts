import { Router, Request, Response } from 'express';
import admin from '../Src/Firebase';
import { getAuth } from 'firebase-admin/auth';

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

    // 🔐 Update Firebase Authentication user
    await getAuth().updateUser(id, {
      displayName: name,
      email: email,
    });


    // Update all gameSessions linked to this userId
    const snapshot = await db
      .collection('gameSessions')
      .where('userId', '==', id)
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          studentEmail: email,
          studentName: name,
        });
      });
      await batch.commit();
    }

    res.json({ message: 'Student and related game sessions updated successfully' });
  } catch (error) {
    console.error('Error updating student or sessions:', error);
    res.status(500).json({ error: 'Failed to update student or sessions' });
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

router.get('/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
    const snapshot = await db.collection('users').doc(uid).get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = snapshot.data();
    if (!userData || userData.role !== 'student') {
      return res.status(403).json({ error: 'User is not a student' });
    }

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user student:', error);
    res.status(500).json({ error: 'Failed to fetch user student' });
  }
});
export { router as userStudentsRouter };    