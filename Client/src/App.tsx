import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogInForm from './Pages/LoginForm'
import SignupForm from './Pages/SignupForm';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInForm />} />
        <Route path="/Signup" element={<SignupForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
