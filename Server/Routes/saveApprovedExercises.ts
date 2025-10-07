import admin from '../Src/Firebase';
const db = admin.firestore();

export async function saveApprovedExercises(selectedExercises: { key: string }[]) {
  const approvedIds = selectedExercises.map(ex => ex.key);
  await db.collection("gameConfig").doc("approvedExercises").set({
    approvedIds,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}
