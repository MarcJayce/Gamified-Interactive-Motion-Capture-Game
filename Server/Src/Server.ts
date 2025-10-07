import express from 'express';
import  admin  from '../Src/Firebase';
import { gameSessionRouter } from '../Routes/GameSession';
import { gamesRouter } from '../Routes/Games';
import { fetchExerciseRouter } from '../Routes/FetchExercise';
import { gameConfigRouter } from '../Routes/gameConfig';
import { fetchApprovedExerciseRouter } from '../Routes/FetchApprovedExercise';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

// Routes

app.use('/gameSession', gameSessionRouter); 
app.use('/exercise', gamesRouter);
app.use('/fetch', fetchExerciseRouter);
app.use('/gameConfig', gameConfigRouter);
app.use('/fetchApproved', fetchApprovedExerciseRouter);

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

