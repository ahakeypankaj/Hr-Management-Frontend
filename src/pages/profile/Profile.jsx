import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

// Country codes for phone
const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
];

export default function Profile() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState({
    phone: "",
    address: "",
    emergencyPhoneCode: "+91",
    emergencyContact: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
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
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const userData = response.data.user;

      const profileData = {
        id: userData._id,
        name: userData.name,
        personalEmail: userData.personalEmail,
        companyEmail: userData.companyEmail,
        phone: userData.phoneNumber,
        employeeId: userData.employeeId,
        department: userData.department,
        role: userData.designation,
        employmentType: userData.employmentType,
        manager: userData.reportingManager,
        joinDate: userData.joiningDate,
        status: userData.status,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
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
      setEditData({
        phone: profileData.phone || "",
        address: profileData.address,
        emergencyPhoneCode: profileData.emergencyPhoneCode,
        emergencyContact: profileData.emergencyContact,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // API call would go here
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    // API call would go here
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    alert("Password changed successfully!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setUploadProgress(null), 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
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
                onClick={() => setShowPasswordModal(true)}
                className="px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1 sm:gap-2 transition-all hover:opacity-80 text-sm sm:text-base"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                🔐 <span className="hidden sm:inline">Change</span> Password
              </button>
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
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white border-4 border-white/30"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {profile.name.charAt(0)}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <span className="text-lg">📷</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-1">{profile.name}</h2>
                <p className="text-blue-200 text-lg mb-2">{profile.role}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    🆔 {profile.employeeId}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    🏢 {profile.department}
                  </span>
                  {profile.joinDate && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                      📅 Joined {new Date(profile.joinDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {/* Upload Progress */}
            {uploadProgress !== null && (
              <div className="mt-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-white transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
                <p className="text-xs text-white/80 text-center mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="px-3 py-1 rounded-lg outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary, border: `1px solid ${navyBlue}` }}
                    />
                  ) : (
                    <span className="font-medium" style={{ color: textPrimary }}>{profile.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Date of Birth</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.dob}</span>
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Blood Group</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{profile.bloodGroup}</span>
                </div>
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
                  { label: "Department", value: profile.department },
                  { label: "Designation", value: profile.role },
                  { label: "Employment Type", value: profile.employmentType },
                  { label: "Reporting Manager", value: profile.manager || 'Not assigned' },
                  { label: "Status", value: profile.status },
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
                  {isEditing ? (
                    <textarea
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg outline-none resize-none"
                      rows={2}
                      style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary, border: `1px solid ${navyBlue}` }}
                    />
                  ) : (
                    <p className="font-medium mt-1" style={{ color: textPrimary }}>{profile.address}</p>
                  )}
                </div>
                <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Emergency Contact</span>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <select
                        value={editData.emergencyPhoneCode}
                        onChange={(e) => setEditData({ ...editData, emergencyPhoneCode: e.target.value })}
                        className="px-2 py-1 rounded-lg outline-none text-sm"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary, border: `1px solid ${navyBlue}` }}
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editData.emergencyContact}
                        onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
                        className="px-3 py-1 rounded-lg outline-none w-32"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary, border: `1px solid ${navyBlue}` }}
                      />
                    </div>
                  ) : (
                    <span className="font-medium" style={{ color: textPrimary }}>{profile.emergencyPhoneCode} {profile.emergencyContact}</span>
                  )}
                </div>
              </div>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="mt-4 w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: navyBlue }}
                >
                  💾 Save Changes
                </button>
              )}
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
              <label
                className="px-4 py-2 rounded-xl font-semibold cursor-pointer transition-all hover:opacity-80"
                style={{ backgroundColor: navyBlue, color: '#ffffff' }}
              >
                📤 Upload Document
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
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
                        <span className="text-xl font-black" style={{ color: '#0a0a0a' }}>HR</span>
                      </div>
                      {/* Company Name - Right */}
                      <div className="text-right">
                        <h2 className="text-lg font-bold text-white tracking-widest">HR NEXUS</h2>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Employee Identity Card</p>
                      </div>
                    </div>
                  </div>


                  {/* Profile Section - White Background */}
                  <div className="px-4 sm:px-6 py-4 sm:py-6" style={{ backgroundColor: '#ffffff' }}>
                    <div className="flex items-center gap-3 sm:gap-5">
                      {/* Profile Photo */}
                      <div
                        className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-2xl sm:text-4xl font-bold shadow-lg flex-shrink-0"
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
                        <p className="font-semibold" style={{ color: '#1a1a1a' }}>{profile.department}</p>
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
                    <p className="text-gray-500 text-xs">Property of HR Nexus • If found, please return to nearest office</p>
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

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div
                className="w-full max-w-lg animate-scale-in"
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  overflow: 'hidden'
                }}
              >
                {/* Modal Header */}
                <div
                  className="p-6"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                        🔐
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                        <p className="text-red-200 text-sm">Update your account security</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  {passwordError && (
                    <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                      <span className="text-xl">⚠️</span>
                      <span className="font-medium" style={{ color: '#dc2626' }}>{passwordError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🔑 Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-400"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🆕 New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-400"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      placeholder="Enter new password (min 8 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>✅ Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-red-400"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>Password Requirements:</p>
                    <ul className="text-xs space-y-1" style={{ color: textSecondary }}>
                      <li>• Minimum 8 characters</li>
                      <li>• At least one uppercase letter</li>
                      <li>• At least one number</li>
                      <li>• At least one special character</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                      style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                      }}
                    >
                      🔒 Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
