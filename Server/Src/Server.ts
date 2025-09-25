import express from 'express';
import  admin  from '../Src/Firebase';
import { scoreRouter } from '../Routes/Score';
import { gamesRouter } from '../Routes/Games';
import { fetchExerciseRouter } from '../Routes/FetchExercise';
import cors from 'cors';

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

// Routes

app.use('/score', scoreRouter); 
app.use('/exercise', gamesRouter);
app.use('/fetch', fetchExerciseRouter);

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

