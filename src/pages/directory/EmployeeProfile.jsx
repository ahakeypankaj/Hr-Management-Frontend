import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const mockEmployees = [
  { id: "EMP001", name: "Asha Kumar", dept: "Engineering", role: "Senior Developer", joiningDate: "2024-08-01", email: "asha@company.com", phone: "+91 98765 43210", status: "Active", manager: "Ravi Sharma", location: "Mumbai", skills: ["React", "Node.js", "TypeScript"] },
  { id: "EMP002", name: "Ravi Sharma", dept: "HR", role: "HR Manager", joiningDate: "2023-01-11", email: "ravi@company.com", phone: "+91 98765 43211", status: "Active", manager: "CEO", location: "Mumbai", skills: ["HR Management", "Recruitment", "Training"] },
  { id: "EMP003", name: "Priya Patel", dept: "Engineering", role: "UI/UX Designer", joiningDate: "2023-06-15", email: "priya@company.com", phone: "+91 98765 43212", status: "Active", manager: "Asha Kumar", location: "Bangalore", skills: ["Figma", "Sketch", "Adobe XD"] },
  { id: "EMP004", name: "Vikram Singh", dept: "DevOps", role: "DevOps Engineer", joiningDate: "2024-02-20", email: "vikram@company.com", phone: "+91 98765 43213", status: "Active", manager: "Ravi Sharma", location: "Delhi", skills: ["AWS", "Docker", "Kubernetes"] },
  { id: "EMP005", name: "Anita Verma", dept: "QA", role: "QA Lead", joiningDate: "2022-11-05", email: "anita@company.com", phone: "+91 98765 43214", status: "Active", manager: "Ravi Sharma", location: "Mumbai", skills: ["Testing", "Automation", "Selenium"] },
  { id: "EMP006", name: "Rahul Gupta", dept: "Sales", role: "Sales Executive", joiningDate: "2024-01-10", email: "rahul@company.com", phone: "+91 98765 43215", status: "On Leave", manager: "Ravi Sharma", location: "Chennai", skills: ["Sales", "Negotiation", "CRM"] },
  { id: "EMP007", name: "Sneha Reddy", dept: "Finance", role: "Accountant", joiningDate: "2023-09-01", email: "sneha@company.com", phone: "+91 98765 43216", status: "Active", manager: "Ravi Sharma", location: "Hyderabad", skills: ["Accounting", "Tally", "Excel"] },
  { id: "EMP008", name: "Amit Kumar", dept: "Engineering", role: "Backend Developer", joiningDate: "2024-03-15", email: "amit@company.com", phone: "+91 98765 43217", status: "Active", manager: "Asha Kumar", location: "Pune", skills: ["Java", "Spring Boot", "PostgreSQL"] },
];

const avatarColors = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #16a34a, #2563eb)",
  "linear-gradient(135deg, #ea580c, #dc2626)",
  "linear-gradient(135deg, #7c3aed, #ec4899)",
];

export default function EmployeeProfile() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const emp = mockEmployees.find((x) => x.id === id);

  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length];

  if (!emp) {
    return (
      <div className="max-w-2xl mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="p-8 text-center" style={cardStyle}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}>
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: textPrimary }}>Employee Not Found</h2>
          <p className="mb-4" style={{ color: textSecondary }}>The employee you're looking for doesn't exist.</p>
          <Link to="/directory" className="font-semibold" style={{ color: '#2563eb' }}>← Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Back Button */}
      <Link to="/directory" className="inline-flex items-center gap-2 font-medium" style={{ color: textSecondary }}>
        <span>←</span> Back to Directory
      </Link>

      {/* Profile Header Card */}
      <div style={cardStyle} className="overflow-hidden">
        <div className="h-32" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb, #7c3aed)' }}></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 shadow-lg"
              style={{ background: getAvatarColor(emp.name), borderColor: isDark ? '#1e293b' : '#ffffff' }}
            >
              {emp.name.charAt(0)}
            </div>
            <div className="flex-1 pt-2 md:pt-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>{emp.name}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ 
                    backgroundColor: emp.status === "Active" ? "#dcfce7" : "#ffedd5",
                    color: emp.status === "Active" ? "#16a34a" : "#ea580c"
                  }}
                >
                  {emp.status}
                </span>
              </div>
              <p className="font-semibold" style={{ color: '#2563eb' }}>{emp.role}</p>
              <p style={{ color: textSecondary }}>{emp.dept} Department</p>
            </div>
            <div className="flex gap-2">
              <a href={`mailto:${emp.email}`} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: '#2563eb' }}>
                📧 Email
              </a>
              <a href={`tel:${emp.phone}`} className="px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}>
                📞 Call
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="p-6" style={cardStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Contact Information</h2>
          <div className="space-y-4">
            {[
              { icon: "📧", label: "Email", value: emp.email, bg: "#dbeafe" },
              { icon: "📱", label: "Phone", value: emp.phone, bg: "#dcfce7" },
              { icon: "📍", label: "Location", value: emp.location, bg: "#ffedd5" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                  <span>{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>{item.label}</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Information */}
        <div className="p-6" style={cardStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Work Information</h2>
          <div className="space-y-4">
            {[
              { icon: "🏢", label: "Department", value: emp.dept, bg: "#f3e8ff" },
              { icon: "💼", label: "Role", value: emp.role, bg: "#dbeafe" },
              { icon: "👤", label: "Reports To", value: emp.manager, bg: "#fce7f3" },
              { icon: "📅", label: "Joining Date", value: emp.joiningDate, bg: "#fef9c3" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                  <span>{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>{item.label}</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="p-6" style={cardStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Skills</h2>
        <div className="flex flex-wrap gap-2">
          {emp.skills?.map((skill, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-lg font-semibold text-sm"
              style={{ backgroundColor: isDark ? '#334155' : '#eff6ff', color: '#2563eb' }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Employee ID */}
      <div className="text-center text-sm" style={{ color: textSecondary }}>
        Employee ID: {emp.id}
      </div>
    </div>
  );
}
