import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get<StudentApiResponse>(
          "http://localhost:3001/userStudents"
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
      }
    };
    fetchStudents();
  }, []);

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setFormData(student);
  };

  const handleChange = (field: keyof Student, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await axios.put(`http://localhost:3001/userStudents/${editingId}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingId ? ({ ...s, ...formData } as Student) : s
        )
      );
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleDisable = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`http://localhost:3001/userStudents/${id}/disable`, {
        active: !currentStatus,
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !currentStatus } : s))
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
        Accounts Management
      </h1>

      <div className="space-y-6">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow border border-gray-200"
          >
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {student.name || "Unnamed"}
              </p>
              <p className="text-sm text-gray-600">{student.email}</p>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span
                  className={student.active ? "text-green-600" : "text-red-500"}
                >
                  {student.active ? "Active" : "Disabled"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(student)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  handleDisable(student.id, student.active ?? true)
                }
                className={`px-4 py-2 text-sm font-medium rounded ${
                  student.active
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-gray-500 hover:bg-gray-600"
                } text-white`}
              >
                {student.active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow">
          <h2 className="text-xl font-bold text-blue-700 mb-4">
            Edit Student Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={formData.role || ""}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsManagement;
