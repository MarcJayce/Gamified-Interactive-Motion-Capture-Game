import express from 'express';
import  admin  from '../Src/Firebase';
import { scoreRouter } from '../Routes/Score';

const app = express();
const port = 3001;
app.use(express.json());

// Routes

app.use('/score', scoreRouter); 


app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

