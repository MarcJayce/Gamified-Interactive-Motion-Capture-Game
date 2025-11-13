# Gamified-Interactive-Motion-Capture-Game

A full-stack application that gamifies exercise using motion capture and pose tracking. The project consists of a React + Vite client and an Express + Firebase (Admin SDK + Firestore) server. Teachers can configure available exercises and manage student accounts, while students can play exercise-based games whose sessions are tracked and stored.

## Tech Stack

- Client: `React`, `TypeScript`, `Vite`, `TailwindCSS`, `Firebase Web SDK`
- Server: `Express`, `TypeScript`, `Firebase Admin SDK`, `Firestore`, `dotenv`, `cors`
- Dev tooling: `concurrently` for running client and server together

## Project Structure

- `Client/` — React app
  - `src/App.tsx` — App routing
  - `src/Pages/` — Screens (`LoginForm`, `SignupFormAdmin`, `StudentSignupForm`, `StudentDashboard`, `TeacherDashboard`, `GameScreen`, `ProfilePage`)
  - `src/Components/` — Feature modules (`RequireAuth`, `AccountsManagement`, `ContentManagement`, `Gradebook`)
  - `src/firebase.ts` — Firebase web SDK initialization (Auth + Firestore)
  - `vite.config.ts` — Vite plugins and dev proxy
- `Server/` — Express server
  - `Src/Server.ts` — Express setup and route mounting
  - `Src/Firebase.ts` — Firebase Admin initialization from base64 service account
  - `Routes/` — API endpoints
    - `GameSession.ts` — Upload and list game sessions
    - `Games.ts` — Create game options (exercise definitions)
    - `FetchExercise.ts` — List available exercises from Firestore
    - `FetchApprovedExercise.ts` — List approved exercise keys from `gameConfig`
    - `gameConfig.ts` — Save approved exercises
    - `UserStudents.ts` — Student management endpoints
  - `Seeders/seedExercises.ts` — Populate standard exercise options

## How It Works

- Teachers:
  - Use `ContentManagement` to fetch all exercises and save a subset as approved.
  - Use `AccountsManagement` to view students, edit their details, and enable/disable accounts.
  - Use `Gradebook` to view game sessions for students.
- Students:
  - Sign up and log in.
  - `StudentDashboard` fetches approved exercises and shows a leaderboard.
  - `GameScreen` fetches approved exercises and uploads completed session data.
- Profile:
  - `ProfilePage` reads and updates user info in Firestore and mirrors changes to the backend.

## Environment Configuration

Create `.env` files for both client and server.

### Client `.env`

Required variables (all prefixed with `VITE_` for Vite):

- `VITE_API_BASE_URL` — Base URL of the server (e.g. `http://localhost:3001` or your production URL)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` — optional depending on your Firebase project
- `VITE_POSETRACKER_API` — External pose-tracker API base URL (used by `GameScreen`)
- `VITE_POSETRACKER_KEY` — Pose-tracker API key

### Server `.env`

- `FIREBASE_CREDS_B64` — Base64-encoded string of your Firebase Admin service account JSON. Example:

  1. Obtain service account JSON from Firebase Console.
  2. Encode it: `base64 < serviceAccount.json` (use an equivalent Windows method, e.g. PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes('serviceAccount.json'))`).
  3. Set the resulting base64 as the value of `FIREBASE_CREDS_B64`.

The server listens on port `3001` (configured in `Server/Src/Server.ts`).

## Running Locally

From the repository root:

- Install dependencies for both apps:
  - `npm install`
  - `npm install --prefix Client`
  - `npm install --prefix Server`
- Configure `.env` files as described above.
- Start both client and server:
  - `npm run dev`

Root `package.json` scripts:

- `dev`: runs client and server concurrently
- `client`: runs `vite` in `Client`
- `server`: runs `nodemon ts-node` in `Server`

Alternatively, you can start them independently:

- Client: `npm run dev --prefix Client`
- Server: `npm run dev --prefix Server`

Vite Proxy Note: `Client/vite.config.ts` includes a dev proxy for paths under `/api` to a Render endpoint, but the code primarily uses `VITE_API_BASE_URL`. For local development, set `VITE_API_BASE_URL=http://localhost:3001`.

## Firestore Data Model

- Collection: `users`
  - Document ID: Firebase Auth `uid`
  - Fields: `name: string`, `email: string`, `role: 'student' | 'teacher' | 'admin'`, `weight?: number`, `height?: number`, `active?: boolean`, `createdAt?: Timestamp`
- Collection: `gameOptions`
  - Document ID: exercise key (e.g. `squat`)
  - Fields: `label: string`, `timestamp: number`
- Collection: `gameSessions`
  - Auto-generated doc IDs
  - Fields: `userId: string`, `exerciseKey: string`, `difficulty: string`, `timeLimit: number`, `repsCount: number`, `score: number`, `studentEmail: string`, `studentName: string`, `timestamp: number`
- Collection: `gameConfig` / Document: `approvedExercises`
  - Fields: `approvedIds: string[]`, `updatedAt: serverTimestamp`

## API Reference (Server)

Base URL: `http://localhost:3001`

- `POST /exercise`
  - Create a game option.
  - Body: `{ key: string, label: string }`
  - 201: `{ message: string, exerciseId: string }`

- `GET /fetch`
  - List all `gameOptions`.
  - 200: `{ exercises: { key: string, label: string, timestamp: number }[] }`

- `GET /fetchApproved`
  - List approved exercise keys.
  - 200: `{ approvedIds: string[] }`

- `POST /gameConfig`
  - Save approved exercises.
  - Body: `{ selectedExercises: { key: string }[] }`
  - 200: `{ message: string }`

- `POST /gameSession`
  - Upload a completed session.
  - Body: `{ userId, exerciseKey, difficulty, timeLimit, repsCount, score, studentEmail, studentName }`
  - 201: `{ message: string, sessionId: string }`

- `GET /gameSession/:studentEmail`
  - List sessions for the given email.
  - 200: `GameSession[]`

- `GET /userStudents`
  - List all students (`users` where `role == 'student'`).
  - 200: `{ students: { key: string, name?: string, email: string, role: string, createdAt?: string, active?: boolean }[] }`

- `GET /userStudents/:uid`
  - Fetch specific student. 404 if not found; 403 if user is not a student.
  - 200: `User` document

- `PUT /userStudents/:id`
  - Update a student's `name`, `email`, and `role`. Also updates Firebase Auth `displayName`/`email`, and mirrors changes to all `gameSessions` for that `userId`.
  - Body: `{ name?: string, email?: string, role?: string }`
  - 200: `{ message: string }`

- `PATCH /userStudents/:id/disable`
  - Toggle a student's `active` status.
  - Body: `{ active: boolean }`
  - 200: `{ message: string }`

## Seeding Exercises

The seeder populates `gameOptions` with common exercises.

- File: `Server/Seeders/seedExercises.ts`
- Run with ts-node from `Server/` directory:
  - `npx ts-node Seeders/seedExercises.ts`

Note: The `server` package.json includes a `seed` script pointing to `Src/Seeders/Seeder.ts`. The actual seeder is located at `Seeders/seedExercises.ts`. Run the command above or update the script accordingly.

## Client Features Overview

- `LoginForm` — Email/password login and role-based redirect.
- `SignupFormAdmin` — Admin/teacher signup and user creation in Firestore.
- `StudentSignupForm` — Student registration with profile fields.
- `TeacherDashboard` — Nested routes to `AccountsManagement`, `ContentManagement`, and `Gradebook`.
- `AccountsManagement` — Edit student info, enable/disable, inline UI.
- `ContentManagement` — Select and save approved exercises.
- `Gradebook` — Browse students and view their sessions.
- `StudentDashboard` — Shows approved exercises and builds a leaderboard.
- `GameScreen` — Exercise selection, pose tracking integration, and session upload.
- `ProfilePage` — View/edit profile and list personal game sessions.
- `RequireAuth` — Route guard that redirects unauthenticated users to `/`.

## Deployment Notes

- Client:
  - Includes `vercel.json` rewrite for SPA routing.
  - Configure `VITE_API_BASE_URL` to point to your deployed server (e.g., Render).
- Server:
  - Hosted on a Node-compatible platform (e.g., Render). Ensure `FIREBASE_CREDS_B64` is set.
  - CORS is enabled; if tightening CORS in production, remember to allow the client origin.

## Security and Privacy

- Store Firebase Admin credentials only on the server (`FIREBASE_CREDS_B64`). Never expose admin credentials to the client.
- Use HTTPS in production for both client and server.
- Validate request payloads on the server where appropriate.
- Consider rate limiting and authentication for sensitive endpoints (e.g., student updates).

## Troubleshooting

- Missing Firebase credentials: Server will throw `Missing FIREBASE_CREDS_B64` on startup.
- Seeding script not found: Use `npx ts-node Seeders/seedExercises.ts` inside `Server/`.
- API base URL issues: Ensure `VITE_API_BASE_URL` matches the server host.
- Dev ports: Client runs on Vite (default 5173), server on 3001.

## License

This repository does not currently include an explicit license.