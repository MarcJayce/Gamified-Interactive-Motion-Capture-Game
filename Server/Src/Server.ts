import express from 'express';
import  admin  from './FireBase';


const app = express();
app.use(express.json());

app.get('/ping', (_, res) => res.send('pong'));

// Example Firebase usage
app.get('/users', async (_req, res) => {
  const db = admin.database();
  const ref = db.ref('users');
  const snapshot = await ref.once('value');
  res.json(snapshot.val());
});

app.listen(3001, () => console.log('Server running on port 3001'));

