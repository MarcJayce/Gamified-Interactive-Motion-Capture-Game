import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Student = {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt?: string;
  active?: boolean;
};

type StudentApiResponse = {
  students: {
    key: string;
    name?: string;
    email: string;
    role: string;
    createdAt?: string;
    active?: boolean;
  }[];
};

const AccountsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get<StudentApiResponse>(
          `${API_BASE_URL}/userStudents`
        );
        const students: Student[] = response.data.students.map((s) => ({
          id: s.key,
          name: s.name,
          email: s.email,
          role: s.role,
          createdAt: s.createdAt,
          active: s.active ?? true,
        }));
        setStudents(students);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const getFirstName = (fullName?: string) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  const getLastName = (fullName?: string) => {
    if (!fullName) return "";
    const parts = fullName.split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
  };

  const filteredStudents = students.filter((student) => {
    const name = student.name?.toLowerCase() || "";
    const email = student.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setFormData({ ...student });
    setShowModal(true);
  };

  const handleChange = (field: keyof Student, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await axios.put(`${API_BASE_URL}/userStudents/${editingId}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingId ? ({ ...s, ...formData } as Student) : s
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDisable = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/userStudents/${id}/disable`, {
        active: !currentStatus,
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !currentStatus } : s))
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setFormData({});
    setShowModal(false);
  };

  return (
    <div className="w-full h-full bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">👥 Accounts Management</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading accounts...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center py-16 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-40">👤</div>
              <p className="text-lg font-semibold text-gray-900">
                {searchQuery ? "No students match your search" : "No students found"}
              </p>
              {searchQuery && (
                <p className="text-gray-500 mt-2">Try a different name or email</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">First Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getFirstName(student.name) || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getLastName(student.name) || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">
                        {student.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          student.active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {student.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDisable(student.id, student.active ?? true)
                          }
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            student.active
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-gray-500 text-white hover:bg-gray-600"
                          }`}
                        >
                          {student.active ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Student</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={getFirstName(formData.name) || ""}
                  onChange={(e) => {
                    const lastName = getLastName(formData.name) || "";
                    const newFullName = lastName ? `${e.target.value} ${lastName}` : e.target.value;
                    handleChange("name", newFullName);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={getLastName(formData.name) || ""}
                  onChange={(e) => {
                    const firstName = getFirstName(formData.name) || "";
                    const newFullName = firstName ? `${firstName} ${e.target.value}` : e.target.value;
                    handleChange("name", newFullName);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role || ""}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter role"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsManagement;
