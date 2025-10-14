import "../Page-Css/TeacherDashboard.css";

const TeacherDashboard = () => {
  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <a href="#">👥 Accounts Management</a>
          <a href="/Exercises">🏋️ Content Management</a>
          <a href="#">📘 Gradebook</a>
          <a href="#">📊 Analytics</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Welcome, Teacher!</h1>
      </main>
    </div>
  );
};

export default TeacherDashboard;
