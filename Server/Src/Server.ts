import express from 'express';
import  admin  from './Firebase';


const app = express();
const port = 3001;
app.use(express.json());

app.get('/ping', (_, res) => res.send('pong'));

// Example Firebase usage
app.get('/users', async (_req, res) => {
  const db = admin.database();
  const ref = db.ref('users');
  const snapshot = await ref.once('value');
  res.json(snapshot.val());
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
