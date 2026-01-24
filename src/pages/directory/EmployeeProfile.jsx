import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { fetchEmployees } from "../../services/directoryService";
import { getDepartments } from "../../services/departmentService";

// Map API user data to UI format
// Directory API: profilePicture, department (string or { name, _id })
const mapUserToEmployee = (user) => {
  const deptObj = typeof user.department === "object" ? user.department : null;
  const departmentId = deptObj?._id || (typeof user.department === "string" ? user.department : null) || null;
  const deptNameFromUser = deptObj?.name || null;
  return {
    id: user.employeeId || user._id || "",
    _id: user._id || "",
    name: user.name || "Unknown",
    departmentId,
    dept: deptNameFromUser || (typeof user.department === "string" ? user.department : "") || "",
    role: user.designation || user.role || "",
    joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split("T")[0] : "",
    companyEmail: user.companyEmail || "",
    personalEmail: user.personalEmail || "",
    email: user.companyEmail || user.personalEmail || "",
    phone: user.phoneNumber || "",
    status: user.isActive !== undefined ? (user.isActive ? "Active" : "Inactive") : "Active",
    manager: user.reportingManager || "",
    location: user.location || "",
    skills: user.skills || [],
    profilePicture: user.profilePicture || null,
    employeeId: user.employeeId || "",
    employmentType: user.employmentType || "",
    isActive: user.isActive !== undefined ? user.isActive : true,
    isMicrosoftUser: user.isMicrosoftUser || false,
    createdAt: user.createdAt || "",
    updatedAt: user.updatedAt || "",
    userRole: user.role || "",
    accountStatus: user.status || "",
  };
};

// Deterministic placeholder emergency contact from employee id
const getEmergencyContact = (id) => {
  if (!id) return "+91 98765 43210";
  const s = String(id).replace(/\D/g, "").slice(-8).padStart(8, "0");
  return `+91 98${s.slice(0, 4)} ${s.slice(4, 8)}`;
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
  const [departments, setDepartments] = useState([]);

  const departmentName = useMemo(() => {
    if (!emp) return "";
    // First try to resolve by departmentId (if we have an id)
    if (emp.departmentId && departments.length) {
      const d = departments.find((dept) => dept._id === emp.departmentId);
      if (d?.name) return d.name;
    }
    // Also try matching emp.dept as an id (in case department was passed as string id)
    if (emp.dept && departments.length) {
      const d = departments.find((dept) => dept._id === emp.dept);
      if (d?.name) return d.name;
    }
    // Fallback to dept (could be name from object or string name)
    return emp.dept || "";
  }, [emp, departments]);

  // Fetch departments for resolving department names
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data?.departments ?? []);
      } catch (e) {
        console.error("Failed to fetch departments:", e);
      }
    };
    load();
  }, []);

  // Fetch employee data
  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) {
        setError("No employee ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log('🔍 Loading employee with ID:', id);
        // First, try to fetch all employees and find by ID (since API might need _id)
        const response = await fetchEmployees();
        console.log('📡 Fetched employees response:', response);
        
        if (response.success && Array.isArray(response.users)) {
          // Try to find by _id first, then by employeeId
          const foundEmployee = response.users.find(
            (user) => {
              const matches = user._id === id || user.employeeId === id || user.id === id;
              if (matches) {
                console.log('✅ Found employee:', user);
              }
              return matches;
            }
          );
          
          if (foundEmployee) {
            const mapped = mapUserToEmployee(foundEmployee);
            setEmp(mapped);
            console.log('✅ Employee data set:', mapped);
          } else {
            console.error('❌ Employee not found. Available IDs:', response.users.map(u => ({ _id: u._id, employeeId: u.employeeId })));
            setError(`Employee with ID "${id}" not found`);
          }
        } else {
          console.error('❌ Invalid response structure:', response);
          setError("Failed to load employee data");
        }
      } catch (err) {
        console.error("❌ Error loading employee:", err);
        setError(err.response?.data?.message || err.message || "Failed to load employee");
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const getAvatarColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full pt-20" style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p style={{ color: textSecondary }}>Loading employee details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !emp) {
    return (
      <div className="min-h-screen w-full pt-20" style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-8 text-center" style={cardStyle}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}>
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: textPrimary }}>Employee Not Found</h2>
            <p className="mb-4" style={{ color: textSecondary }}>{error || "The employee you're looking for doesn't exist."}</p>
            <Link to="/directory" className="font-semibold inline-block" style={{ color: '#2563eb' }}>← Back to Directory</Link>
          </div>
        </div>
      </div>
    );
  }

  const navyBlue = '#1e3a5f';

  return (
    <div className="w-full" style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
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
            className="h-48 relative flex items-center px-6 sm:px-8"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)' }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Content on gradient background */}
            <div className="relative z-10 flex items-center gap-6 w-full">
              {/* Avatar */}
              {emp.profilePicture ? (
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center border-4 shadow-2xl transition-transform hover:scale-105 overflow-hidden flex-shrink-0"
                  style={{ 
                    borderColor: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}
                >
                  <img 
                    src={emp.profilePicture} 
                    alt={emp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to avatar if image fails to load
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-full h-full hidden items-center justify-center text-white text-4xl font-bold avatar-fallback"
                    style={{ 
                      background: getAvatarColor(emp.name)
                    }}
                  >
                    {emp.name && emp.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center text-white text-4xl font-bold border-4 shadow-2xl transition-transform hover:scale-105 flex-shrink-0"
                  style={{ 
                    background: getAvatarColor(emp.name), 
                    borderColor: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}
                >
                  {emp.name && emp.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Profile Info on Gradient */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {emp.name || "Unknown Employee"}
                  </h1>
                  {emp.status && (
                    <span
                      className="px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: emp.status === "Active" ? "#dcfce7" : "#ffedd5",
                        color: emp.status === "Active" ? "#16a34a" : "#ea580c"
                      }}
                    >
                      {emp.status === "Active" ? "✓ Active" : "○ Inactive"}
                    </span>
                  )}
                </div>
                {emp.role && (
                  <p className="text-xl font-semibold mb-1 text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                    {emp.role}
                  </p>
                )}
                {departmentName && (
                  <p className="text-base text-white/90" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                    {departmentName} Department
                  </p>
                )}
              </div>

              {(emp.email || emp.phone) && (
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  {emp.email && (
                    <a 
                      href={`mailto:${emp.email}`} 
                      className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105 shadow-lg bg-white/20 backdrop-blur-sm border border-white/30"
                    >
                      📧 Email
                    </a>
                  )}
                  {emp.phone && (
                    <a 
                      href={`tel:${emp.phone}`} 
                      className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105 bg-white/20 backdrop-blur-sm border border-white/30"
                    >
                      📞 Call
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {((emp.id || emp._id) || emp.joiningDate) && (
            <div className="px-6 sm:px-8 py-6">
              <div className="flex flex-wrap gap-3">
                {(emp.id || emp._id) && (
                  <span className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                    🆔 ID: {emp.id || emp._id}
                  </span>
                )}
                {emp.joiningDate && (
                  <span className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                    📅 Joined: {emp.joiningDate}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Work Info */}
          <div 
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Information */}
            <div className="p-4" style={cardStyle}>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                📞 Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emp.companyEmail && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                        📧
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Company Email</p>
                        <p className="font-semibold text-xs break-all" style={{ color: textPrimary }}>{emp.companyEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.personalEmail && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#f3e8ff' }}>
                        📧
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Personal Email</p>
                        <p className="font-semibold text-xs break-all" style={{ color: textPrimary }}>{emp.personalEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.phone && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dcfce7' }}>
                        📱
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Phone Number</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.location && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#ffedd5' }}>
                        📍
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Location</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.location}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                      🚨
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Emergency Contact</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>{getEmergencyContact(emp.id || emp._id)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="p-4" style={cardStyle}>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                💼 Work Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departmentName && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#f3e8ff' }}>
                        🏢
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Department</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{departmentName}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.role && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                        💼
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Designation</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.role}</p>
                      </div>
                    </div>
                  </div>
                )}
                {(emp.employeeId || emp.id) && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fce7f3' }}>
                        🆔
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Employee ID</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.employeeId || emp.id}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.joiningDate && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fef9c3' }}>
                        📅
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Joining Date</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.joiningDate}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.manager && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dcfce7' }}>
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Reporting Manager</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                          {emp.manager}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.employmentType && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fef3c7' }}>
                        💼
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Employment Type</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.employmentType}</p>
                      </div>
                    </div>
                  </div>
                )}
                {emp.userRole && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#e0e7ff' }}>
                        👔
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>User Role</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>{emp.userRole}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* {emp.accountStatus && (
                  <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fce7f3' }}>
                        🔐
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Account Status</p>
                        <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                          {emp.accountStatus.charAt(0).toUpperCase() + emp.accountStatus.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                )} */}
                <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dbeafe' }}>
                      🔑
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Microsoft User</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                        {emp.isMicrosoftUser ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            {(emp.createdAt || emp.updatedAt) && (
              <div className="p-4" style={cardStyle}>
                <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  📋 Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {emp.createdAt && (
                    <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#dcfce7' }}>
                          ➕
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Account Created</p>
                          <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                            {new Date(emp.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                            {new Date(emp.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {emp.updatedAt && (
                    <div className="p-3 rounded-lg transition-all hover:scale-[1.01]" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: '#fef3c7' }}>
                          🔄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Last Updated</p>
                          <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                            {new Date(emp.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                            {new Date(emp.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {emp.skills && emp.skills.length > 0 && (
              <div className="p-4" style={cardStyle}>
                <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  🎯 Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {emp.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:scale-105"
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
          <div 
            className="space-y-6"
          >
            {/* Quick Stats Card */}
            <div className="p-4" style={cardStyle}>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                📊 Quick Overview
              </h2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>Employee Status</p>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-bold inline-block"
                    style={{ 
                      backgroundColor: emp.status === "Active" ? "#dcfce7" : "#ffedd5",
                      color: emp.status === "Active" ? "#16a34a" : "#ea580c"
                    }}
                  >
                    {emp.status === "Active" ? "✓ Active Employee" : "○ Inactive"}
                  </span>
                </div>

                {(emp.id || emp._id) && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Employee ID</p>
                    <p className="font-bold text-sm font-mono" style={{ color: textPrimary }}>
                      {emp.id || emp._id}
                    </p>
                  </div>
                )}

                {emp.joiningDate && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>Date of Joining</p>
                    <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                      {emp.joiningDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(emp.email || emp.phone) && (
              <div className="p-4" style={cardStyle}>
                <h2 className="text-lg font-bold mb-4 pb-3 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  ⚡ Quick Actions
                </h2>
                <div className="space-y-2">
                  {emp.email && (
                    <a 
                      href={`mailto:${emp.email}`}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: '#2563eb',
                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      📧 Send Email
                    </a>
                  )}
                  {emp.phone && (
                    <a 
                      href={`tel:${emp.phone}`}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: isDark ? '#334155' : '#f1f5f9', 
                        color: textPrimary 
                      }}
                    >
                      📞 Make Call
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
