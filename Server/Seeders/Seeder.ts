console.log('🚀 Seeder script started!');

import admin from '../Src/Firebase';
import { v4 as uuidv4 } from 'uuid';

console.log('✅ Imports loaded successfully');

const db = admin.firestore();
console.log('✅ Firestore initialized');

interface GameSession {
  exerciseKey: string;
  difficulty: string;
  timeLimit: number;
  repsCount: number;
  score: number;
  timestamp: admin.firestore.Timestamp;
}

const exercises = [
  { key: 'squat', label: 'Squat' },
  { key: 'pushup', label: 'Push-up' },
  { key: 'lunge', label: 'Lunge' }
];

const difficulties = ['easy', 'medium', 'hard'];
const timeLimits = [30, 60, 120];

const generateRandomGameSessions = (count: number): GameSession[] => {
  return Array(count).fill(null).map(() => ({
    exerciseKey: exercises[Math.floor(Math.random() * exercises.length)].key,
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    timeLimit: timeLimits[Math.floor(Math.random() * timeLimits.length)],
    repsCount: Math.floor(Math.random() * 20) + 1,
    score: Math.floor(Math.random() * 100),
    timestamp: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
    )
  }));
};

const seedStudents = async () => {
  try {
    console.log('🚀 Starting seeding process...');
    
    const students = Array(15).fill(null).map((_, index) => ({
      email: `student20${index + 1}@gmail.com`,
      password: 'password123',
      name: `Student ${index + 1}`,
      role: 'student',
      active: true,
      created: admin.firestore.Timestamp.now()
    }));

    console.log(`📝 Generated ${students.length} students`);

    for (const student of students) {
      try {
        console.log(`\n👤 Processing student: ${student.email}`);
        
        // Create Firebase Auth user
        const userRecord = await admin.auth().createUser({
          email: student.email,
          password: student.password,
          displayName: student.name
        });

        const uid = userRecord.uid;
        console.log(`✓ Created auth user with UID: ${uid}`);

        // Create user document in Firestore
        await db.collection('users').doc(uid).set({
          email: student.email,
          name: student.name,
          role: student.role,
          active: student.active,
          created: student.created,
          uid
        });
        console.log(`✓ Created user document in Firestore`);

        // Generate 5 game sessions for each student
        const gameSessions = generateRandomGameSessions(5);
        console.log(`📊 Generated ${gameSessions.length} game sessions`);
        
        // Store game sessions in the gameSessions collection using Promise.all
        const sessionPromises = gameSessions.map((session, i) => {
          const sessionId = uuidv4();
          
          const sessionData = {
            exerciseKey: session.exerciseKey,
            difficulty: session.difficulty,
            timeLimit: session.timeLimit,
            repsCount: session.repsCount,
            score: session.score,
            timestamp: session.timestamp,
            id: sessionId,
            userId: uid,
            studentName: student.name,
            studentEmail: student.email
          };
          
          console.log(`  📝 Creating session ${i + 1}/${gameSessions.length}: ${sessionId}`);
          
          return db.collection('gameSessions').doc(sessionId).set(sessionData)
            .then(() => {
              console.log(`  ✓ Successfully created session ${sessionId}`);
            })
            .catch((error) => {
              console.error(`  ❌ Failed to create session ${sessionId}:`, error);
              throw error;
            });
        });

        await Promise.all(sessionPromises);

        console.log(`✅ Created student ${student.email} with ${gameSessions.length} game sessions`);
      } catch (studentError: any) {
        console.error(`❌ Failed to create student ${student.email}`);
        console.error('Error message:', studentError?.message || studentError);
        console.error('Error code:', studentError?.code);
        console.error('Full error:', studentError);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('⏳ Waiting 3 seconds for Firestore to sync...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error: any) {
    console.error('❌ Error seeding database');
    console.error('Error message:', error?.message || error);
    console.error('Full error:', error);
    throw error;
  }
};

// Run the seeder
console.log('📍 About to run seeder...');

(async () => {
  console.log('📍 Inside async IIFE');
  try {
    await seedStudents();
    console.log('📍 seedStudents completed successfully');
    console.log('✨ Exiting with success code');
    process.exit(0);
  } catch (error: any) {
    console.error('💥 Fatal error during seeding');
    console.error('Error:', error?.message || error);
    process.exit(1);
  }
})();

console.log('📍 IIFE invoked');