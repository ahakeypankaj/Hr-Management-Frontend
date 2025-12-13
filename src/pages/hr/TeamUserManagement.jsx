import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

// Combined mock data from both TeamManagement and UserManagement
const mockMembers = [
  { 
    id: "EMP001", 
    name: "Asha Kumar",
    candidateName: "Asha Kumar",
    email: "asha@company.com",
    personalEmail: "asha.personal@gmail.com",
    phoneCode: "+91", 
    phone: "9876543210", 
    role: "employee", 
    jobTitle: "Senior Developer",
    dept: "Engineering",
    department: "Engineering",
    designation: "Senior Developer",
    status: "Active",
    attendance: "95%",
    leaves: 2,
    joinDate: "2024-08-01",
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    managerId: "MGR002"
  },
  { 
    id: "EMP002", 
    name: "Ravi Sharma",
    candidateName: "Ravi Sharma",
    email: "ravi@company.com",
    personalEmail: "ravi.personal@gmail.com",
    phoneCode: "+91", 
    phone: "9876500000", 
    role: "hr_manager", 
    jobTitle: "HR Manager",
    dept: "HR",
    department: "HR",
    designation: "HR Manager",
    status: "Active",
    attendance: "98%",
    leaves: 1,
    joinDate: "2023-01-11",
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    managerId: "MGR003"
  },
  { 
    id: "EMP003", 
    name: "Priya Patel",
    candidateName: "Priya Patel",
    email: "priya@company.com",
    personalEmail: "priya.personal@gmail.com",
    phoneCode: "+91", 
    phone: "9876543211", 
    role: "employee", 
    jobTitle: "UI/UX Designer",
    dept: "Engineering",
    department: "Engineering",
    designation: "UI/UX Designer",
    status: "Active",
    attendance: "98%",
    leaves: 1,
    joinDate: "2023-06-15",
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    managerId: "MGR002"
  },
  { 
    id: "EMP007", 
    name: "Sanjay Mehta",
    candidateName: "Sanjay Mehta",
    email: "sanjay@company.com",
    personalEmail: "sanjay.m@gmail.com",
    phoneCode: "+91", 
    phone: "9876543215", 
    role: "employee", 
    jobTitle: "Frontend Developer",
    dept: "Engineering",
    department: "Engineering",
    designation: "Frontend Developer",
    status: "Pending",
    attendance: "0%",
    leaves: 0,
    joinDate: "2025-01-02",
    onboardingStatus: "documents_pending",
    documentStatus: { resume: "verified", offerLetter: "pending", salaryBreakup: "pending" },
    bgvStatus: "in_progress",
    managerId: "MGR002"
  },
  { 
    id: "EMP004", 
    name: "Vikram Singh",
    candidateName: "Vikram Singh",
    email: "vikram@company.com",
    personalEmail: "vikram.personal@gmail.com",
    phoneCode: "+91", 
    phone: "9876543212", 
    role: "employee", 
    jobTitle: "DevOps Engineer",
    dept: "DevOps",
    department: "DevOps",
    designation: "DevOps Engineer",
    status: "Active",
    attendance: "92%",
    leaves: 3,
    joinDate: "2024-02-20",
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    managerId: "MGR002"
  },
];

const departments = ["All", "Engineering", "DevOps", "QA", "Sales", "Product", "Finance", "HR", "Marketing"];
const statusOptions = ["All", "Active", "Pending", "On Leave"];

const mockManagers = [
  { id: "MGR001", name: "Ravi Sharma", dept: "HR" },
  { id: "MGR002", name: "Priya Verma", dept: "Engineering" },
  { id: "MGR003", name: "Suresh Reddy", dept: "Finance" },
  { id: "MGR004", name: "Anita Patel", dept: "Marketing" },
];

const ITEMS_PER_PAGE = 10;

export default function TeamUserManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [members, setMembers] = useState(mockMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const defaultBorderColor = isDark ? '#475569' : '#e2e8f0';
  const inputStyle = {
    backgroundColor: isDark ? '#334155' : '#f8fafc',
    border: `1px solid ${defaultBorderColor}`,
    color: textPrimary
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.name || member.candidateName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || (member.department || member.dept) === filterDept;
    const matchesStatus = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  // Handlers
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };


  const handleUpdateStatus = (memberId, field, value) => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        if (field === 'documentStatus') {
          return { ...m, documentStatus: { ...m.documentStatus, ...value } };
        } else if (field === 'bgvStatus') {
          return { ...m, bgvStatus: value };
        } else if (field === 'status') {
          return { ...m, status: value };
        } else if (field === 'onboardingStatus') {
          return { ...m, onboardingStatus: value };
        }
      }
      return m;
    }));
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember({ ...selectedMember, [field]: value });
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
      pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
      "on leave": { bg: "#dbeafe", color: "#2563eb", label: "On Leave" },
      "On Leave": { bg: "#dbeafe", color: "#2563eb", label: "On Leave" },
    };
    return styles[status?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
  };

  const getOnboardingStyle = (status) => {
    const styles = {
      completed: { bg: "#dcfce7", color: "#16a34a", label: "Onboarded" },
      documents_pending: { bg: "#fef3c7", color: "#d97706", label: "Docs Pending" },
      bgv_in_progress: { bg: "#dbeafe", color: "#2563eb", label: "BGV In Progress" },
    };
    return styles[status] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "verified": return { bg: "#dcfce7", color: "#16a34a", icon: "✓" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", icon: "⏳" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", icon: "✗" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "?" };
    }
  };

  // Combined stats
  const stats = [
    { label: "Total Members", value: members.length, color: "#2563eb", icon: "👥" },
    { label: "Active", value: members.filter(m => m.status === "Active" || m.status === "active").length, color: "#16a34a", icon: "✅" },
    { label: "Pending", value: members.filter(m => m.status === "Pending" || m.status === "pending").length, color: "#d97706", icon: "⏳" },
    { label: "BGV Pending", value: members.filter(m => m.bgvStatus === "in_progress").length, color: "#7c3aed", icon: "🔍" },
  ];

  const getManagerName = (managerId) => {
    const manager = mockManagers.find(m => m.id === managerId);
    return manager ? manager.name : "Not Assigned";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>User Management</h1>
        <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Manage employees and track information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {stats.map((stat, index) => (
          <div key={index} className="p-5 hover-lift" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${stat.color}20` }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 animate-fade-in-up" style={cardStyle}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
              style={inputStyle}
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
          >
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: textSecondary }}>
            Showing {paginatedMembers.length} of {filteredMembers.length} members
          </span>
        </div>
      </div>

      {/* Members List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div 
          className="p-5"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
          }}
        >
          <h2 className="text-lg font-bold text-white">All Team Members & Employees</h2>
        </div>

        {paginatedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-4">👥</span>
            <p className="font-semibold" style={{ color: textPrimary }}>No members found</p>
            <p className="text-sm" style={{ color: textSecondary }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {paginatedMembers.map((member) => {
              const statusStyle = getStatusStyle(member.status);
              const onboardingStyle = getOnboardingStyle(member.onboardingStatus);
              const memberName = member.name || member.candidateName;
              const memberDept = member.department || member.dept;
              const memberJobTitle = member.jobTitle || member.designation;
              
              return (
                <div 
                  key={member.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-opacity-50 transition-all"
                  style={{ backgroundColor: isDark ? 'transparent' : 'transparent' }}
                >
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}
                    >
                      {memberName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: textPrimary }}>{memberName}</p>
                      <p className="text-sm truncate" style={{ color: textSecondary }}>
                        {memberJobTitle} • {memberDept}
                      </p>
                      <p className="text-xs" style={{ color: textSecondary }}>ID: {member.id}</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                    {member.onboardingStatus && (
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: onboardingStyle.bg, color: onboardingStyle.color }}
                      >
                        {onboardingStyle.label}
                      </span>
                    )}
                    {member.attendance && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                        📊 {member.attendance}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewMember(member)}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
        >
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: textSecondary }}>
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6 sticky top-0"
              style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMember.name || selectedMember.candidateName}</h2>
                    <p className="text-blue-200 text-sm">{selectedMember.jobTitle || selectedMember.designation} • {selectedMember.department || selectedMember.dept}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>Email</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>Phone</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{selectedMember.phoneCode} {selectedMember.phone}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>Employee ID</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{selectedMember.id}</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>Join Date</p>
                  <p className="font-semibold" style={{ color: textPrimary }}>{selectedMember.joinDate}</p>
                </div>
              </div>

              {/* Stats */}
              {(selectedMember.attendance || selectedMember.leaves !== undefined) && (
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  {selectedMember.attendance && (
                    <div className="text-center">
                      <p className="text-xs" style={{ color: textSecondary }}>Attendance</p>
                      <p className="text-xl font-bold" style={{ color: '#16a34a' }}>{selectedMember.attendance}</p>
                    </div>
                  )}
                  {selectedMember.leaves !== undefined && (
                    <div className="text-center">
                      <p className="text-xs" style={{ color: textSecondary }}>Leaves</p>
                      <p className="text-xl font-bold" style={{ color: '#ea580c' }}>{selectedMember.leaves}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Status */}
              {selectedMember.documentStatus && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>📁 Document Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(selectedMember.documentStatus).map(([doc, status]) => {
                      const docStyle = getDocStatusStyle(status);
                      return (
                        <div key={doc} className="p-2 rounded-lg text-center" style={{ backgroundColor: docStyle.bg }}>
                          <p className="text-xs font-semibold capitalize" style={{ color: docStyle.color }}>
                            {docStyle.icon} {doc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BGV Status */}
              {selectedMember.bgvStatus && (
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: textPrimary }}>🔍 BGV Status</p>
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-bold inline-block"
                    style={{ 
                      backgroundColor: selectedMember.bgvStatus === 'completed' ? '#dcfce7' : '#dbeafe',
                      color: selectedMember.bgvStatus === 'completed' ? '#16a34a' : '#2563eb'
                    }}
                  >
                    {selectedMember.bgvStatus === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => { setShowViewModal(false); handleEditMember(selectedMember); }}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-2xl animate-scale-in"
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
              style={{ background: `linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ✏️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit Employee</h2>
                    <p className="text-purple-200 text-sm">Update employee information and status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Status</label>
                <select
                  value={selectedMember.status}
                  onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="On Leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Document Status */}
              {selectedMember.documentStatus && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Document Verification</label>
                  <div className="space-y-3">
                    {Object.keys(selectedMember.documentStatus).map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                        <span className="font-medium capitalize" style={{ color: textPrimary }}>{doc}</span>
                        <select
                          value={selectedMember.documentStatus[doc]}
                          onChange={(e) => handleUpdateStatus(selectedMember.id, 'documentStatus', { [doc]: e.target.value })}
                          className="px-3 py-2 rounded-lg outline-none text-sm"
                          style={inputStyle}
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BGV Status */}
              {selectedMember.bgvStatus && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>BGV Status</label>
                  <select
                    value={selectedMember.bgvStatus}
                    onChange={(e) => handleUpdateStatus(selectedMember.id, 'bgvStatus', e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}

              {/* Onboarding Status */}
              {selectedMember.onboardingStatus && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Onboarding Status</label>
                  <select
                    value={selectedMember.onboardingStatus}
                    onChange={(e) => handleUpdateStatus(selectedMember.id, 'onboardingStatus', e.target.value)}
                    className="w-full px-4 py-4 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    <option value="documents_pending">Documents Pending</option>
                    <option value="bgv_in_progress">BGV In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setMembers(members.map(m => m.id === selectedMember.id ? selectedMember : m));
                    setShowEditModal(false);
                  }}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
