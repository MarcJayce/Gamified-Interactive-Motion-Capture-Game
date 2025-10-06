import admin from '../Src/Firebase';
const db = admin.firestore();

const exerciseOptions = [
  "squat", "pushup", "jumpingjack", "lunge", "plank",
  "armraise", "shoulderpress", "situp", "crunch",
  "warriorpose", "treepose", "downwarddog",
];

const exerciseLabels: { [key: string]: string } = {
  squat: "Squat",
  pushup: "Push-Up",
  jumpingjack: "Jumping Jack",
  lunge: "Lunge",
  plank: "Plank",
  armraise: "Arm Raise",
  shoulderpress: "Shoulder Press",
  situp: "Sit-Up",
  crunch: "Crunch",
  warriorpose: "Warrior Pose",
  treepose: "Tree Pose",
  downwarddog: "Downward Dog",
};

async function seedExercises() {
    const batch = db.batch();
    exerciseOptions.forEach((key) => {
        const docRef = db.collection('gameOptions').doc(key);
        batch.set(docRef, {
            label: exerciseLabels[key],
            timestamp: Date.now(),
        });
    });
    
    try {
    await batch.commit();
    console.log('✅ Exercises seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed exercises:', error);
  }
    
}
seedExercises();
