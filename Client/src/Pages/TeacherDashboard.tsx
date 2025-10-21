import { Routes, Route, Link } from "react-router-dom";
import "../Page-Css/TeacherDashboard.css";
import ContentManagement from "../Components/ContentManagement"; 
import AccountsManagement from "../Components/AccountsManagement";
import StudentSessions from "../Components/Gradebook";


const TeacherDashboard = () => {
  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <Link to="/TeacherDashboard/accounts">👥 Accounts Management</Link>
          <Link to="/TeacherDashboard/exercises">🏋️ Content Management</Link>
          <Link to="/TeacherDashboard/gradebook">📘 Gradebook</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<h1>Welcome, Teacher!</h1>} />
          <Route path="/accounts" element={<AccountsManagement />} />
          <Route path="/exercises" element={<ContentManagement />} />
          <Route path="/gradebook" element={<StudentSessions />} />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
