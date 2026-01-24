import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { getDepartments } from "../../services/departmentService";


export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);

  const departmentName = useMemo(() => {
    if (!profile) return "";
    const dept = profile.department;
    if (!dept) return "";
    // If department is an object with name
    if (typeof dept === "object" && dept?.name) {
      return dept.name;
    }
    // If department is an ID string, try to resolve from departments API
    if (typeof dept === "string" && departments.length) {
      const found = departments.find((d) => d._id === dept);
      if (found?.name) return found.name;
      // If not found by ID, might be a name already
      return dept;
    }
    // Fallback to department as string
    return typeof dept === "string" ? dept : "";
  }, [profile, departments]);

  const [showIDCardModal, setShowIDCardModal] = useState(false);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    fetchProfile();
    // Fetch departments for resolving department names
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data?.departments ?? []);
      } catch (e) {
        console.error("Failed to fetch departments:", e);
      }
    };
    loadDepartments();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const userData = response.data.user;
      console.log("userData", userData);

      const profileData = {
        id: userData._id,
        name: userData.name,
        personalEmail: userData.personalEmail,
        companyEmail: userData.companyEmail,
        phone: userData.phoneNumber,
        employeeId: userData.employeeId,
        department: userData.department,
        departmentId: typeof userData.department === "object" ? userData.department?._id : (typeof userData.department === "string" ? userData.department : null),
        role: userData.designation,
        employmentType: userData.employmentType,
        manager: userData.reportingManager,
        joinDate: userData.joiningDate,
        status: userData.status,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        profilePicture: userData.profilePicture || null,
        // Additional fields with defaults
        location: "Bangalore, India", // Can be made dynamic if available
        address: "Address not provided", // Can be made dynamic if available
        dob: "Date of birth not provided", // Can be made dynamic if available
        bloodGroup: "Not specified", // Can be made dynamic if available
        emergencyPhoneCode: "+91",
        emergencyContact: "Not provided", // Can be made dynamic if available
        skills: ["Skills not specified"], // Can be made dynamic if available
        documents: [
          { name: "Aadhar Card", status: "pending", uploadedAt: "Not uploaded" },
          { name: "PAN Card", status: "pending", uploadedAt: "Not uploaded" },
        ]
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">❌</span>
          <p className="text-lg font-medium" style={{ color: textPrimary }}>{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: navyBlue, color: '#ffffff' }}
          >
            Try Again
          </button>
        </div>
      ) : profile ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>My Profile</h1>
              <p className="text-sm sm:text-base" style={{ color: textSecondary }}>View and manage your personal information</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowIDCardModal(true)}
                className="px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1 sm:gap-2 transition-all hover:opacity-80 text-sm sm:text-base"
                style={{ backgroundColor: navyBlue, color: '#ffffff' }}
              >
                🪪 <span className="hidden sm:inline">View</span> ID Card
              </button>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="p-6 animate-fade-in-up" style={{ ...cardStyle, background: `linear-gradient(135deg, ${navyBlue}, #2563eb)` }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white border-4 border-white/30 ${profile.profilePicture ? 'hidden' : ''}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {profile.name.charAt(0)}
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-1">{profile.name}</h2>
                <p className="text-blue-200 text-lg mb-2">{profile.role}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    🆔 {profile.employeeId}
                  </span>
                  {departmentName && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      🏢 {departmentName}
                    </span>
                  )}
                  {profile.joinDate && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      📅 Joined {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="p-6 animate-fade-in-up stagger-1" style={cardStyle}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>👤</span>
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Full Name</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.name}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Personal Email</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.personalEmail}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Company Email</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.companyEmail}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Phone</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.phone || 'Not provided'}</span>
                </div>
                {/* <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Date of Birth</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.dob}</span>
                </div> */}
                {/* <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Blood Group</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.bloodGroup}</span>
                </div> */}
              </div>
            </div>

            {/* Work Information */}
            <div className="p-6 animate-fade-in-up stagger-2" style={cardStyle}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>💼</span>
                Work Information
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Employee ID", value: profile.employeeId },
                  { label: "Department", value: departmentName || "Not assigned" },
                  { label: "Designation", value: profile.role },
                  { label: "Employment Type", value: profile.employmentType },
                  // { label: "Status", value: profile.status },
                  { label: "Joining Date", value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Not set' },
                  { label: "Location", value: profile.location },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <span style={{ color: textSecondary }}>{item.label}</span>
                    <span className="font-medium" style={{ color: textPrimary }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Emergency */}
            <div className="p-6 animate-fade-in-up stagger-3" style={cardStyle}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>📍</span>
                Address & Emergency
              </h3>
              <div className="space-y-4">
                <div>
                  <label style={{ color: textSecondary }} className="text-sm">Address</label>
                  <p className="font-medium mt-1" style={{ color: textPrimary }}>{profile.address}</p>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Emergency Contact</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.emergencyPhoneCode} {profile.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="p-6 animate-fade-in-up stagger-4" style={cardStyle}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>🎯</span>
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="p-6 animate-fade-in-up stagger-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: textPrimary }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>📁</span>
                Documents
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile.documents.map((doc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: textPrimary }}>{doc.name}</p>
                      <p className="text-xs" style={{ color: textSecondary }}>{doc.uploadedAt}</p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: doc.status === 'verified' ? '#dcfce7' : '#fef3c7',
                      color: doc.status === 'verified' ? '#16a34a' : '#d97706'
                    }}
                  >
                    {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View ID Card Modal */}
          {showIDCardModal && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <div
                className="w-full max-w-md animate-scale-in"
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* ID Card - Black/White/Grey Theme */}
                <div
                  className="relative"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 50%, #e5e5e5 100%)',
                    minHeight: '500px'
                  }}
                >
                  {/* Black Header Strip */}
                  <div
                    className="px-6 py-4"
                    style={{ backgroundColor: '#0a0a0a' }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Company Logo - Left */}
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <span className="text-xl font-black" style={{ color: '#0a0a0a' }}>IT</span>
                      </div>
                      {/* Company Name - Right */}
                      <div className="text-right">
                        <h2 className="text-lg font-bold text-white tracking-widest">Irish Taylor & Co</h2>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Employee Identity Card</p>
                      </div>
                    </div>
                  </div>


                  {/* Profile Section - White Background */}
                  <div className="px-4 sm:px-6 py-4 sm:py-6" style={{ backgroundColor: '#ffffff' }}>
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Profile Photo */}
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt={profile.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shadow-lg flex-shrink-0"
                          style={{ border: '3px solid #e5e5e5' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-bold shadow-lg flex-shrink-0 ${profile.profilePicture ? 'hidden' : ''}`}
                        style={{
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          border: '3px solid #e5e5e5'
                        }}
                      >
                        {profile.name.charAt(0)}
                      </div>
                      {/* Employee Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-xl font-bold truncate" style={{ color: '#0a0a0a' }}>{profile.name}</h3>
                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#666666' }}>{profile.role}</p>
                        <div
                          className="mt-2 px-2 sm:px-3 py-1 rounded-md inline-block"
                          style={{ backgroundColor: '#0a0a0a' }}
                        >
                          <span className="text-white text-xs sm:text-sm font-bold tracking-wider">{profile.employeeId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grey Divider */}
                  <div style={{ height: '2px', backgroundColor: '#d4d4d4' }} />

                  {/* Info Grid - Light Grey Background */}
                  <div className="px-6 py-5" style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>Department</p>
                        <p className="font-semibold" style={{ color: '#1a1a1a' }}>{departmentName || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>Blood Group</p>
                        <p className="font-semibold" style={{ color: '#1a1a1a' }}>{profile.bloodGroup}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>Joining Date</p>
                        <p className="font-semibold" style={{ color: '#1a1a1a' }}>{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>Location</p>
                        <p className="font-semibold" style={{ color: '#1a1a1a' }}>{profile.location.split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info - White Background */}
                  <div className="px-6 py-4" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>📧</span>
                        <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{profile.companyEmail}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>📱</span>
                        <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{profile.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Dark Grey with QR */}
                  <div
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ backgroundColor: '#2a2a2a' }}
                  >
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Valid Until</p>
                      <p className="text-white font-bold">December 2025</p>
                    </div>
                    {/* QR Code */}
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <div className="grid grid-cols-4 gap-0.5">
                        {[...Array(16)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5"
                            style={{ backgroundColor: Math.random() > 0.5 ? '#0a0a0a' : 'transparent' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Black Strip */}
                  <div
                    className="px-6 py-2 text-center"
                    style={{ backgroundColor: '#0a0a0a' }}
                  >
                    <p className="text-gray-500 text-xs">Property of Irish Taylor & Co • If found, please return to nearest office</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="p-4 flex gap-3"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#f8fafc' }}
                >
                  <button
                    onClick={() => setShowIDCardModal(false)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}
                  >
                    Close
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
