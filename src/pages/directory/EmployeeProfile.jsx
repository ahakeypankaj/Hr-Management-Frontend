import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { fetchEmployee, fetchEmployees } from "../../services/directoryService";

// Map API user data to UI format
const mapUserToEmployee = (user) => {
  return {
    id: user.employeeId || user._id,
    _id: user._id,
    name: user.name || "",
    dept: user.department || "",
    role: user.designation || user.role || "",
    joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : "",
    email: user.companyEmail || user.personalEmail || "",
    phone: user.phoneNumber || "",
    status: user.isActive ? "Active" : "Inactive",
    manager: user.reportingManager || "N/A",
    location: user.location || "N/A",
    skills: user.skills || [], // API might not have skills, default to empty array
  };
};

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
  const [emp, setEmp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee data
  useEffect(() => {
    const loadEmployee = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First, try to fetch all employees and find by ID (since API might need _id)
        const response = await fetchEmployees();
        if (response.success && Array.isArray(response.users)) {
          // Try to find by _id first, then by employeeId
          const foundEmployee = response.users.find(
            (user) => user._id === id || user.employeeId === id
          );
          
          if (foundEmployee) {
            setEmp(mapUserToEmployee(foundEmployee));
          } else {
            setError("Employee not found");
          }
        } else {
          setError("Failed to load employee data");
        }
      } catch (err) {
        console.error("Error loading employee:", err);
        setError(err.response?.data?.message || err.message || "Failed to load employee");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadEmployee();
    }
  }, [id]);

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

  const navyBlue = '#1e3a5f';

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back Button */}
        <Link 
          to="/directory" 
          className="inline-flex items-center gap-2 font-medium transition-all hover:opacity-80"
          style={{ color: textSecondary }}
        >
          <span className="text-xl">←</span> 
          <span>Back to Directory</span>
        </Link>

        {/* Profile Header Section - Full Width */}
        <div style={cardStyle} className="overflow-hidden shadow-xl">
          <div 
            className="h-48 relative"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)' }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center text-white text-4xl font-bold border-4 shadow-2xl transition-transform hover:scale-105"
                style={{ 
                  background: getAvatarColor(emp.name), 
                  borderColor: isDark ? '#1e293b' : '#ffffff' 
                }}
              >
                {emp.name.charAt(0).toUpperCase()}
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4 lg:pt-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>{emp.name}</h1>
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ 
                      backgroundColor: emp.status === "Active" ? "#dcfce7" : "#ffedd5",
                      color: emp.status === "Active" ? "#16a34a" : "#ea580c"
                    }}
                  >
                    {emp.status === "Active" ? "✓ Active" : "○ Inactive"}
                  </span>
                </div>
                <p className="text-xl font-semibold mb-1" style={{ color: '#2563eb' }}>{emp.role || "N/A"}</p>
                <p className="text-base" style={{ color: textSecondary }}>
                  {emp.dept || "N/A"} Department
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm px-3 py-1 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                    🆔 ID: {emp.id || emp._id || "N/A"}
                  </span>
                  {emp.joiningDate && (
                    <span className="text-sm px-3 py-1 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                      📅 Joined: {emp.joiningDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`mailto:${emp.email}`} 
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: '#2563eb',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  📧 Email
                </a>
                <a 
                  href={`tel:${emp.phone}`} 
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f1f5f9', 
                    color: textPrimary 
                  }}
                >
                  📞 Call
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Work Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="p-6" style={cardStyle}>
              <h2 className="text-xl font-bold mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                📞 Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#dbeafe' }}>
                      📧
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Email Address</p>
                      <p className="font-semibold text-sm break-all" style={{ color: textPrimary }}>
                        {emp.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#dcfce7' }}>
                      📱
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Phone Number</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#ffedd5' }}>
                      📍
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Location</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.location || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="p-6" style={cardStyle}>
              <h2 className="text-xl font-bold mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                💼 Work Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#f3e8ff' }}>
                      🏢
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Department</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.dept || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#dbeafe' }}>
                      💼
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Designation</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.role || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#fce7f3' }}>
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Reporting Manager</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.manager || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: '#fef9c3' }}>
                      📅
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textSecondary }}>Joining Date</p>
                      <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                        {emp.joiningDate || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            {emp.skills && emp.skills.length > 0 && (
              <div className="p-6" style={cardStyle}>
                <h2 className="text-xl font-bold mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  🎯 Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-3">
                  {emp.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: isDark ? '#334155' : '#eff6ff', 
                        color: '#2563eb',
                        border: `1px solid ${isDark ? '#475569' : '#bfdbfe'}`
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Stats / Additional Info */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="p-6" style={cardStyle}>
              <h2 className="text-xl font-bold mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                📊 Quick Overview
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>Employee Status</p>
                  <span
                    className="px-4 py-2 rounded-full text-sm font-bold inline-block"
                    style={{ 
                      backgroundColor: emp.status === "Active" ? "#dcfce7" : "#ffedd5",
                      color: emp.status === "Active" ? "#16a34a" : "#ea580c"
                    }}
                  >
                    {emp.status === "Active" ? "✓ Active Employee" : "○ Inactive"}
                  </span>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>Employee ID</p>
                  <p className="font-bold text-base font-mono" style={{ color: textPrimary }}>
                    {emp.id || emp._id || "N/A"}
                  </p>
                </div>

                {emp.joiningDate && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>Date of Joining</p>
                    <p className="font-semibold text-base" style={{ color: textPrimary }}>
                      {emp.joiningDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Actions */}
            <div className="p-6" style={cardStyle}>
              <h2 className="text-xl font-bold mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <a 
                  href={`mailto:${emp.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: '#2563eb',
                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  📧 Send Email
                </a>
                <a 
                  href={`tel:${emp.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f1f5f9', 
                    color: textPrimary 
                  }}
                >
                  📞 Make Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
