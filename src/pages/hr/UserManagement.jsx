import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

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
];

const mockManagers = [
  { id: "MGR001", name: "Ravi Sharma", dept: "HR" },
  { id: "MGR002", name: "Priya Verma", dept: "Engineering" },
  { id: "MGR003", name: "Suresh Reddy", dept: "Finance" },
  { id: "MGR004", name: "Anita Patel", dept: "Marketing" },
];

const mockUsers = [
  { 
    id: "EMP001", 
    candidateName: "Asha Kumar", 
    personalEmail: "asha.personal@gmail.com",
    email: "asha@company.com", 
    phoneCode: "+91", 
    phone: "98765 43210", 
    role: "employee", 
    jobDetails: {
      jobTitle: "Software Engineer",
      department: "Engineering",
      designation: "Senior Developer",
      jobLevel: "L4",
      jobType: "Full-time",
      proposedJoiningDate: "2024-08-01"
    },
    managerId: "MGR002",
    status: "active", 
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    createdAt: "2024-07-15"
  },
  { 
    id: "EMP002", 
    candidateName: "Ravi Sharma", 
    personalEmail: "ravi.personal@gmail.com",
    email: "ravi@company.com", 
    phoneCode: "+91", 
    phone: "98765 00000", 
    role: "hr_manager", 
    jobDetails: {
      jobTitle: "HR Manager",
      department: "HR",
      designation: "HR Manager",
      jobLevel: "L5",
      jobType: "Full-time",
      proposedJoiningDate: "2023-01-11"
    },
    managerId: "MGR003",
    status: "active", 
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    createdAt: "2023-01-01"
  },
  { 
    id: "EMP007", 
    candidateName: "Sanjay Mehta", 
    personalEmail: "sanjay.m@gmail.com",
    email: "sanjay@company.com", 
    phoneCode: "+91", 
    phone: "98765 43215", 
    role: "employee", 
    jobDetails: {
      jobTitle: "Frontend Developer",
      department: "Engineering",
      designation: "Frontend Developer",
      jobLevel: "L3",
      jobType: "Full-time",
      proposedJoiningDate: "2025-01-02"
    },
    managerId: "MGR002",
    status: "pending", 
    onboardingStatus: "documents_pending",
    documentStatus: { resume: "verified", offerLetter: "pending", salaryBreakup: "pending" },
    bgvStatus: "in_progress",
    createdAt: "2024-12-01"
  },
  { 
    id: "EMP008", 
    candidateName: "Meera Joshi", 
    personalEmail: "meera.j@gmail.com",
    email: "meera@company.com", 
    phoneCode: "+91", 
    phone: "98765 43216", 
    role: "employee", 
    jobDetails: {
      jobTitle: "Product Manager",
      department: "Product",
      designation: "Product Manager",
      jobLevel: "L4",
      jobType: "Full-time",
      proposedJoiningDate: "2025-01-15"
    },
    managerId: "MGR002",
    status: "pending", 
    onboardingStatus: "bgv_in_progress",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "in_progress",
    createdAt: "2024-12-05"
  },
  { 
    id: "EMP009", 
    candidateName: "Karan Malhotra", 
    personalEmail: "karan.m@gmail.com",
    email: "karan@company.com", 
    phoneCode: "+91", 
    phone: "98765 43217", 
    role: "employee", 
    jobDetails: {
      jobTitle: "Finance Analyst",
      department: "Finance",
      designation: "Finance Analyst",
      jobLevel: "L3",
      jobType: "Full-time",
      proposedJoiningDate: "2023-09-20"
    },
    managerId: "MGR003",
    status: "active", 
    onboardingStatus: "completed",
    documentStatus: { resume: "verified", offerLetter: "verified", salaryBreakup: "verified" },
    bgvStatus: "completed",
    createdAt: "2023-09-10"
  },
];

const departments = ["All", "Engineering", "HR", "DevOps", "QA", "Sales", "Product", "Finance", "Marketing"];
const statuses = ["All", "active", "pending", "on_leave", "inactive"];
const roles = ["All", "employee", "hr_manager"];
const jobLevels = ["L1", "L2", "L3", "L4", "L5", "L6"];
const jobTypes = ["Full-time", "Part-time", "Contract", "Intern"];

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New employee form
  const initialFormState = {
    candidateName: "",
    personalEmail: "",
    phoneCode: "+91",
    phone: "",
    jobDetails: {
      jobTitle: "",
      department: "",
      designation: "",
      jobLevel: "L3",
      jobType: "Full-time",
      proposedJoiningDate: ""
    },
    managerId: "",
    role: "employee",
    resume: null,
    offerLetter: null,
    salaryBreakup: null,
  };
  const [newEmployee, setNewEmployee] = useState(initialFormState);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.personalEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "All" || user.jobDetails.department === selectedDept;
    const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
    const matchesRole = selectedRole === "All" || user.role === selectedRole;
    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = () => setCurrentPage(1);

  const getStatusStyle = (status) => {
    const styles = {
      active: { bg: "#dcfce7", color: "#16a34a" },
      pending: { bg: "#fef3c7", color: "#d97706" },
      on_leave: { bg: "#dbeafe", color: "#2563eb" },
      inactive: { bg: "#fee2e2", color: "#dc2626" },
    };
    return styles[status] || { bg: "#f1f5f9", color: "#64748b" };
  };

  const getOnboardingStyle = (status) => {
    const styles = {
      completed: { bg: "#dcfce7", color: "#16a34a", label: "Onboarded" },
      documents_pending: { bg: "#fef3c7", color: "#d97706", label: "Docs Pending" },
      bgv_in_progress: { bg: "#dbeafe", color: "#2563eb", label: "BGV In Progress" },
      documents_verified: { bg: "#f3e8ff", color: "#7c3aed", label: "Docs Verified" },
    };
    return styles[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "verified": return { bg: "#dcfce7", color: "#16a34a", icon: "✓" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", icon: "⏳" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", icon: "✗" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "?" };
    }
  };

  const getBgvStatusStyle = (status) => {
    switch (status) {
      case "completed": return { bg: "#dcfce7", color: "#16a34a", label: "✓ Completed" };
      case "in_progress": return { bg: "#dbeafe", color: "#2563eb", label: "⏳ In Progress" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", label: "⏸ Pending" };
      case "failed": return { bg: "#fee2e2", color: "#dc2626", label: "✗ Failed" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  const stats = [
    { label: "Total Users", value: users.length, color: "#2563eb", icon: "👥" },
    { label: "Active", value: users.filter(u => u.status === "active").length, color: "#16a34a", icon: "✅" },
    { label: "Pending", value: users.filter(u => u.status === "pending").length, color: "#d97706", icon: "⏳" },
    { label: "BGV Pending", value: users.filter(u => u.bgvStatus === "in_progress").length, color: "#7c3aed", icon: "🔍" },
  ];

  const handleAddEmployee = () => {
    const newId = `EMP${String(users.length + 1).padStart(3, '0')}`;
    const newUser = {
      id: newId,
      ...newEmployee,
      email: newEmployee.personalEmail.replace('@gmail.com', '@company.com').replace('@yahoo.com', '@company.com'),
      status: "pending",
      onboardingStatus: "documents_pending",
      documentStatus: { 
        resume: newEmployee.resume ? "pending" : "pending", 
        offerLetter: newEmployee.offerLetter ? "pending" : "pending", 
        salaryBreakup: newEmployee.salaryBreakup ? "pending" : "pending" 
      },
      bgvStatus: "pending",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
    setNewEmployee(initialFormState);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateStatus = (userId, field, value) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        if (field === 'documentStatus') {
          return { ...u, documentStatus: { ...u.documentStatus, ...value } };
        } else if (field === 'bgvStatus') {
          return { ...u, bgvStatus: value };
        } else if (field === 'status') {
          return { ...u, status: value };
        } else if (field === 'onboardingStatus') {
          return { ...u, onboardingStatus: value };
        }
      }
      return u;
    }));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(users.find(u => u.id === userId));
    }
  };

  const handleSaveEdit = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditModal(false);
  };

  const getManagerName = (managerId) => {
    const manager = mockManagers.find(m => m.id === managerId);
    return manager ? manager.name : "Not Assigned";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>User Management</h1>
          <p style={{ color: textSecondary }}>Manage employees, onboarding, and verification status</p>
        </div>
        <button
          onClick={() => navigate("/hr/users/add")}
          className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
        >
          + Add New Employee
        </button>
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
      <div className="p-4 flex flex-col md:flex-row gap-4 animate-fade-in-up" style={cardStyle}>
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
            className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          />
        </div>
        <select
          value={selectedDept}
          onChange={(e) => { setSelectedDept(e.target.value); handleFilterChange(); }}
          className="px-4 py-3 rounded-xl outline-none font-medium"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
        >
          {departments.map((dept) => <option key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</option>)}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); handleFilterChange(); }}
          className="px-4 py-3 rounded-xl outline-none font-medium"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
        >
          {statuses.map((status) => <option key={status} value={status}>{status === "All" ? "All Status" : status.replace("_", " ").toUpperCase()}</option>)}
        </select>
        <select
          value={selectedRole}
          onChange={(e) => { setSelectedRole(e.target.value); handleFilterChange(); }}
          className="px-4 py-3 rounded-xl outline-none font-medium"
          style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
        >
          {roles.map((role) => <option key={role} value={role}>{role === "All" ? "All Roles" : role === "hr_manager" ? "HR/Manager" : "Employee"}</option>)}
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm" style={{ color: textSecondary }}>
        Showing {paginatedUsers.length} of {filteredUsers.length} users
      </p>

      {/* Users Table */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <tr>
                {["Employee", "Job Details", "Status", "Documents", "BGV", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const statusStyle = getStatusStyle(user.status);
                const onboardingStyle = getOnboardingStyle(user.onboardingStatus);
                const bgvStyle = getBgvStatusStyle(user.bgvStatus);
                return (
                  <tr key={user.id} className="hover:bg-opacity-50 transition-all" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(135deg, ${navyBlue}, #2563eb)` }}>
                          {user.candidateName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: textPrimary }}>{user.candidateName}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>{user.personalEmail}</p>
                          <p className="text-xs font-mono" style={{ color: navyBlue }}>{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: textPrimary }}>{user.jobDetails.jobTitle}</p>
                      <p className="text-xs" style={{ color: textSecondary }}>{user.jobDetails.department} • {user.jobDetails.jobLevel}</p>
                      <p className="text-xs" style={{ color: textSecondary }}>Manager: {getManagerName(user.managerId)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold block w-fit mb-1" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {user.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: onboardingStyle.bg, color: onboardingStyle.color }}>
                        {onboardingStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {['resume', 'offerLetter', 'salaryBreakup'].map((doc) => {
                          const docStyle = getDocStatusStyle(user.documentStatus[doc]);
                          return (
                            <span 
                              key={doc} 
                              className="w-6 h-6 rounded flex items-center justify-center text-xs"
                              style={{ backgroundColor: docStyle.bg, color: docStyle.color }}
                              title={`${doc}: ${user.documentStatus[doc]}`}
                            >
                              {docStyle.icon}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: bgvStyle.bg, color: bgvStyle.color }}>
                        {bgvStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold" 
                          style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold" 
                          style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex items-center justify-between" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: currentPage === page ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
                    color: currentPage === page ? '#ffffff' : textPrimary
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-3xl animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ 
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ➕
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                    <p className="text-green-200 text-sm">Create a new employee record</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Candidate Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newEmployee.candidateName} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, candidateName: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                      placeholder="Full name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Personal Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      value={newEmployee.personalEmail} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, personalEmail: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                      placeholder="personal@email.com" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select 
                        value={newEmployee.phoneCode} 
                        onChange={(e) => setNewEmployee({ ...newEmployee, phoneCode: e.target.value })} 
                        className="px-3 py-3 rounded-xl outline-none" 
                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      >
                        {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}
                      </select>
                      <input 
                        type="text" 
                        value={newEmployee.phone} 
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} 
                        className="flex-1 px-4 py-3 rounded-xl outline-none" 
                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                        placeholder="98765 43210" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Job Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newEmployee.jobDetails.jobTitle} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, jobTitle: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                      placeholder="Software Engineer" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Department <span className="text-red-500">*</span></label>
                    <select 
                      value={newEmployee.jobDetails.department} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, department: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      <option value="">Select Department</option>
                      {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Designation <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newEmployee.jobDetails.designation} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, designation: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                      placeholder="Senior Developer" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Job Level</label>
                    <select 
                      value={newEmployee.jobDetails.jobLevel} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, jobLevel: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      {jobLevels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Job Type</label>
                    <select 
                      value={newEmployee.jobDetails.jobType} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, jobType: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Proposed Joining Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={newEmployee.jobDetails.proposedJoiningDate} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, jobDetails: { ...newEmployee.jobDetails, proposedJoiningDate: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                    />
                  </div>
                </div>
              </div>

              {/* Manager & Role */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Reporting Manager <span className="text-red-500">*</span></label>
                    <select 
                      value={newEmployee.managerId} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, managerId: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      <option value="">Select Manager</option>
                      {mockManagers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.dept})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Role</label>
                    <select 
                      value={newEmployee.role} 
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      <option value="employee">Employee</option>
                      <option value="hr_manager">HR/Manager</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'resume', label: 'Resume', icon: '📄' },
                    { key: 'offerLetter', label: 'Offer Letter', icon: '📋' },
                    { key: 'salaryBreakup', label: 'Salary Breakup', icon: '💰' }
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>{doc.label}</label>
                      <label 
                        className="flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
                        style={{ 
                          backgroundColor: newEmployee[doc.key] ? '#dcfce7' : (isDark ? '#334155' : '#f8fafc'), 
                          border: `2px dashed ${newEmployee[doc.key] ? '#16a34a' : (isDark ? '#475569' : '#e2e8f0')}`,
                          color: newEmployee[doc.key] ? '#16a34a' : textSecondary
                        }}
                      >
                        {newEmployee[doc.key] ? (
                          <>✓ {newEmployee[doc.key].name?.substring(0, 15)}...</>
                        ) : (
                          <>{doc.icon} Upload</>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setNewEmployee({ ...newEmployee, [doc.key]: e.target.files[0] })} 
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80" 
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEmployee} 
                  disabled={!newEmployee.candidateName || !newEmployee.personalEmail || !newEmployee.phone || !newEmployee.jobDetails.jobTitle || !newEmployee.jobDetails.department || !newEmployee.managerId}
                  className="flex-1 py-4 rounded-xl font-bold text-white disabled:opacity-50 transition-all hover:opacity-90" 
                  style={{ 
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
                  }}
                >
                  ✨ Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedUser && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-3xl animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header with Profile */}
            <div 
              className="p-8"
              style={{ 
                background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Employee Details</h2>
                    <p className="text-blue-200 text-sm">View employee information</p>
                  </div>
                </div>
              </div>
              
              {/* Profile Info in Header */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white bg-white/20 shadow-lg">
                  {selectedUser.candidateName.charAt(0)}
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{selectedUser.candidateName}</h3>
                  <p className="text-blue-100 text-lg">{selectedUser.jobDetails.jobTitle}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">{selectedUser.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">{selectedUser.jobDetails.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 200px)' }}>
              {/* Personal Info */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Personal Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p style={{ color: textSecondary }}>Email: <span style={{ color: textPrimary }}>{selectedUser.personalEmail}</span></p>
                  <p style={{ color: textSecondary }}>Phone: <span style={{ color: textPrimary }}>{selectedUser.phoneCode} {selectedUser.phone}</span></p>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Job Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p style={{ color: textSecondary }}>Department: <span style={{ color: textPrimary }}>{selectedUser.jobDetails.department}</span></p>
                  <p style={{ color: textSecondary }}>Designation: <span style={{ color: textPrimary }}>{selectedUser.jobDetails.designation}</span></p>
                  <p style={{ color: textSecondary }}>Level: <span style={{ color: textPrimary }}>{selectedUser.jobDetails.jobLevel}</span></p>
                  <p style={{ color: textSecondary }}>Type: <span style={{ color: textPrimary }}>{selectedUser.jobDetails.jobType}</span></p>
                  <p style={{ color: textSecondary }}>Manager: <span style={{ color: textPrimary }}>{getManagerName(selectedUser.managerId)}</span></p>
                  <p style={{ color: textSecondary }}>Joining: <span style={{ color: textPrimary }}>{selectedUser.jobDetails.proposedJoiningDate}</span></p>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Verification Status</h3>
                <div className="space-y-4">
                  {/* Document Status */}
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: textPrimary }}>📄 Document Verification</p>
                    <div className="flex gap-3">
                      {[
                        { key: 'resume', label: 'Resume' },
                        { key: 'offerLetter', label: 'Offer Letter' },
                        { key: 'salaryBreakup', label: 'Salary Breakup' }
                      ].map((doc) => {
                        const docStyle = getDocStatusStyle(selectedUser.documentStatus[doc.key]);
                        return (
                          <div key={doc.key} className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: docStyle.bg }}>
                            <p className="text-xs font-medium mb-1" style={{ color: docStyle.color }}>{doc.label}</p>
                            <p className="text-lg">{docStyle.icon}</p>
                            <p className="text-xs capitalize" style={{ color: docStyle.color }}>{selectedUser.documentStatus[doc.key]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BGV Status */}
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: textPrimary }}>🔍 Background Verification</p>
                    <span className="px-4 py-2 rounded-full font-medium" style={{ backgroundColor: getBgvStatusStyle(selectedUser.bgvStatus).bg, color: getBgvStatusStyle(selectedUser.bgvStatus).color }}>
                      {getBgvStatusStyle(selectedUser.bgvStatus).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-5" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80" 
                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
              >
                Close
              </button>
              <button 
                onClick={() => { setShowViewModal(false); handleEditUser(selectedUser); }} 
                className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90" 
                style={{ 
                  background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                  boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
                }}
              >
                ✏️ Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedUser && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-3xl animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ✏️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit Employee</h2>
                    <p className="text-purple-200 text-sm">Update employee information & status</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Candidate Name</label>
                    <input 
                      type="text" 
                      value={selectedUser.candidateName} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, candidateName: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Personal Email</label>
                    <input 
                      type="email" 
                      value={selectedUser.personalEmail} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, personalEmail: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Job Title</label>
                    <input 
                      type="text" 
                      value={selectedUser.jobDetails.jobTitle} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, jobDetails: { ...selectedUser.jobDetails, jobTitle: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Department</label>
                    <select 
                      value={selectedUser.jobDetails.department} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, jobDetails: { ...selectedUser.jobDetails, department: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>Status Updates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Employee Status</label>
                    <select 
                      value={selectedUser.status} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Onboarding Status</label>
                    <select 
                      value={selectedUser.onboardingStatus} 
                      onChange={(e) => setSelectedUser({ ...selectedUser, onboardingStatus: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl outline-none" 
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    >
                      <option value="documents_pending">Documents Pending</option>
                      <option value="documents_verified">Documents Verified</option>
                      <option value="bgv_in_progress">BGV In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Verification */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>📄 Document Verification</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'resume', label: 'Resume' },
                    { key: 'offerLetter', label: 'Offer Letter' },
                    { key: 'salaryBreakup', label: 'Salary Breakup' }
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>{doc.label}</label>
                      <select 
                        value={selectedUser.documentStatus[doc.key]} 
                        onChange={(e) => setSelectedUser({ 
                          ...selectedUser, 
                          documentStatus: { ...selectedUser.documentStatus, [doc.key]: e.target.value } 
                        })} 
                        className="w-full px-4 py-3 rounded-xl outline-none" 
                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="verified">✓ Verified</option>
                        <option value="rejected">✗ Rejected</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* BGV Status */}
              <div>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>🔍 Background Verification</h3>
                <select 
                  value={selectedUser.bgvStatus} 
                  onChange={(e) => setSelectedUser({ ...selectedUser, bgvStatus: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl outline-none" 
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="pending">⏸ Pending</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="completed">✓ Completed</option>
                  <option value="failed">✗ Failed</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80" 
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90" 
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
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
