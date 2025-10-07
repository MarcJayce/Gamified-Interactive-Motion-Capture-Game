import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogInForm from './Pages/LoginForm'
import SignupForm from './Pages/SignupForm';
import StudentDashboard from './Pages/StudentDashboard';
import GameScreen from './Pages/GameScreen';
import RequireAuth from './Components/RequireAuth';
import ContentManagement from './Components/ContentManagement';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInForm />} />
        <Route path="/Signup" element={<SignupForm />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/GameScreen" element={<GameScreen />} />
        <Route
          path="/GameScreen"
          element={
            <RequireAuth>
              <GameScreen />
            </RequireAuth>
          }
        />
        <Route path="/Exercises" element={<ContentManagement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
