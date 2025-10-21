import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogInForm from './Pages/LoginForm'
import SignupForm from './Pages/SignupFormAdmin';
import StudentDashboard from './Pages/StudentDashboard';
import TeacherDashboard from './Pages/TeacherDashboard';
import GameScreen from './Pages/GameScreen';
import RequireAuth from './Components/RequireAuth';
import StudentSignupForm from './Pages/StudentSignupForm';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInForm />} />
        <Route path="/AdminSignup" element={<SignupForm />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/TeacherDashboard/*" element={<TeacherDashboard />}>
        </Route>
        <Route path="/GameScreen" element={<GameScreen />} />
        <Route path="/StudentSignup" element={<StudentSignupForm />} />
        <Route
          path="/GameScreen"
          element={
            <RequireAuth>
              <GameScreen />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
