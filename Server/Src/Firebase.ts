import admin from 'firebase-admin';
import { Buffer } from 'buffer';
import dotenv from 'dotenv';

dotenv.config();

const b64 = process.env.FIREBASE_CREDS_B64;

if (!b64) {
  throw new Error('Missing FIREBASE_CREDS_B64');
}

const decoded = Buffer.from(b64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
