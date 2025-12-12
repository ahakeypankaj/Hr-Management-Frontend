import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const mockTeamMembers = [
  { id: "EMP001", name: "Asha Kumar", role: "Senior Developer", dept: "Engineering", email: "asha@company.com", status: "Active", attendance: "95%", leaves: 2, joinDate: "2024-08-01", phone: "+91 98765 43210", tasks: ["Frontend Development", "Code Review"] },
  { id: "EMP003", name: "Priya Patel", role: "UI/UX Designer", dept: "Engineering", email: "priya@company.com", status: "Active", attendance: "98%", leaves: 1, joinDate: "2023-06-15", phone: "+91 98765 43211", tasks: ["Design System", "User Research"] },
  { id: "EMP004", name: "Vikram Singh", role: "DevOps Engineer", dept: "DevOps", email: "vikram@company.com", status: "Active", attendance: "92%", leaves: 3, joinDate: "2024-02-20", phone: "+91 98765 43212", tasks: ["CI/CD Pipeline", "Server Monitoring"] },
  { id: "EMP005", name: "Anita Verma", role: "QA Lead", dept: "QA", email: "anita@company.com", status: "Active", attendance: "96%", leaves: 2, joinDate: "2022-11-05", phone: "+91 98765 43213", tasks: ["Test Automation", "Quality Assurance"] },
  { id: "EMP006", name: "Rahul Gupta", role: "Sales Executive", dept: "Sales", email: "rahul@company.com", status: "On Leave", attendance: "88%", leaves: 5, joinDate: "2024-01-10", phone: "+91 98765 43214", tasks: ["Client Meetings", "Lead Generation"] },
  { id: "EMP008", name: "Amit Kumar", role: "Backend Developer", dept: "Engineering", email: "amit@company.com", status: "Active", attendance: "94%", leaves: 2, joinDate: "2024-03-15", phone: "+91 98765 43215", tasks: ["API Development", "Database Design"] },
  { id: "EMP009", name: "Neha Sharma", role: "Product Manager", dept: "Product", email: "neha@company.com", status: "Active", attendance: "97%", leaves: 1, joinDate: "2023-09-01", phone: "+91 98765 43216", tasks: ["Product Roadmap", "Sprint Planning"] },
  { id: "EMP010", name: "Kiran Reddy", role: "Data Analyst", dept: "Analytics", email: "kiran@company.com", status: "Active", attendance: "93%", leaves: 3, joinDate: "2024-04-10", phone: "+91 98765 43217", tasks: ["Data Analysis", "Report Generation"] },
  { id: "EMP011", name: "Deepak Joshi", role: "Frontend Developer", dept: "Engineering", email: "deepak@company.com", status: "On Leave", attendance: "91%", leaves: 4, joinDate: "2023-07-20", phone: "+91 98765 43218", tasks: ["UI Components", "Performance Optimization"] },
  { id: "EMP012", name: "Sunita Menon", role: "HR Executive", dept: "HR", email: "sunita@company.com", status: "Active", attendance: "99%", leaves: 0, joinDate: "2022-05-15", phone: "+91 98765 43219", tasks: ["Recruitment", "Employee Engagement"] },
];

const departments = ["All", "Engineering", "DevOps", "QA", "Sales", "Product", "Analytics", "HR"];
const statusOptions = ["All", "Active", "On Leave"];
const priorities = ["Low", "Medium", "High", "Critical"];
const ITEMS_PER_PAGE = 5;

export default function TeamManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Existing states
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Form states
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    dept: "Engineering",
    phone: "",
  });
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
  });

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || member.dept === filterDept;
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
  const handleAddMember = () => {
    const newId = `EMP${String(teamMembers.length + 1).padStart(3, '0')}`;
    const member = {
      ...newMember,
      id: newId,
      status: "Active",
      attendance: "0%",
      leaves: 0,
      joinDate: new Date().toISOString().split('T')[0],
      tasks: [],
    };
    setTeamMembers([member, ...teamMembers]);
    setNewMember({ name: "", email: "", role: "", dept: "Engineering", phone: "" });
    setShowAddModal(false);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleAssignTask = (member) => {
    setSelectedMember(member);
    setTaskForm({ title: "", description: "", dueDate: "", priority: "Medium" });
    setShowTaskModal(true);
  };

  const handleSubmitTask = () => {
    if (selectedMember && taskForm.title) {
      setTeamMembers(teamMembers.map(m => 
        m.id === selectedMember.id 
          ? { ...m, tasks: [...m.tasks, taskForm.title] }
          : m
      ));
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", dueDate: "", priority: "Medium" });
      alert(`Task "${taskForm.title}" assigned to ${selectedMember.name}!`);
    }
  };

  // Stats
  const teamStats = [
    { label: "Total Members", value: teamMembers.length, color: "#2563eb", icon: "👥" },
    { label: "Active Today", value: teamMembers.filter(m => m.status === "Active").length, color: "#16a34a", icon: "✅" },
    { label: "On Leave", value: teamMembers.filter(m => m.status === "On Leave").length, color: "#ea580c", icon: "🏖️" },
    { label: "Avg Attendance", value: "94%", color: "#7c3aed", icon: "📊" },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>Team Management</h1>
          <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Manage your team members and track performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm sm:text-base w-full sm:w-auto"
          style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
        >
          + Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {teamStats.map((stat, index) => (
          <div key={index} className="p-5 hover-lift" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${stat.color}20` }}
              >
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
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            />
          </div>
          
          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none font-medium"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none font-medium"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 text-sm" style={{ color: textSecondary }}>
          Showing {paginatedMembers.length} of {filteredMembers.length} members
        </div>
      </div>

      {/* Team Members Table */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
        <div className="p-6" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <tr>
                {["Employee", "Role", "Department", "Status", "Attendance", "Leaves Used", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="text-4xl block mb-2">👥</span>
                    <p style={{ color: textSecondary }}>No team members found</p>
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: textPrimary }}>{member.name}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: textPrimary }}>{member.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
                        {member.dept}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: member.status === "Active" ? "#dcfce7" : "#ffedd5",
                          color: member.status === "Active" ? "#16a34a" : "#ea580c"
                        }}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: textPrimary }}>{member.attendance}</td>
                    <td className="px-6 py-4" style={{ color: textSecondary }}>{member.leaves} days</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMember(member)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAssignTask(member)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}
                        >
                          Assign Task
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up stagger-3">
        {[
          { title: "Assign Goals", desc: "Set performance goals for team", icon: "🎯", color: "#2563eb" },
          { title: "Schedule Review", desc: "Plan performance reviews", icon: "📅", color: "#7c3aed" },
          { title: "Team Report", desc: "Generate team performance report", icon: "📊", color: "#16a34a" },
        ].map((action, i) => (
          <div key={i} className="p-5 cursor-pointer transition-transform hover:scale-[1.02] hover-lift" style={cardStyle}>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${action.color}20` }}
              >
                {action.icon}
              </div>
              <div>
                <h3 className="font-bold" style={{ color: textPrimary }}>{action.title}</h3>
                <p className="text-sm" style={{ color: textSecondary }}>{action.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Team Member Modal */}
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
            className="w-full max-w-xl animate-scale-in"
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
              style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                    <p className="text-green-200 text-sm">Add a new member to your team</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>👤 Full Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-green-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📧 Email Address *</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-green-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="email@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>💼 Role *</label>
                  <input
                    type="text"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-green-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="e.g., Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🏢 Department *</label>
                  <select
                    value={newMember.dept}
                    onChange={(e) => setNewMember({ ...newMember, dept: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {departments.filter(d => d !== "All").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📱 Phone Number</label>
                <input
                  type="text"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-green-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!newMember.name || !newMember.email || !newMember.role}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
                  }}
                >
                  ✨ Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className="w-full max-w-2xl animate-scale-in"
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
              style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Member Details</h2>
                    <p className="text-blue-200 text-sm">View team member information</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white bg-white/20 shadow-lg">
                  {selectedMember.name.charAt(0)}
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <p className="text-blue-100 text-lg">{selectedMember.role}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">{selectedMember.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">{selectedMember.dept}</span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: selectedMember.status === "Active" ? "rgba(22, 163, 74, 0.3)" : "rgba(234, 88, 12, 0.3)" }}
                    >
                      {selectedMember.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 200px)' }}>
              {/* Contact Info */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>📧 Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p style={{ color: textSecondary }}>Email</p>
                    <p className="font-medium" style={{ color: textPrimary }}>{selectedMember.email}</p>
                  </div>
                  <div>
                    <p style={{ color: textSecondary }}>Phone</p>
                    <p className="font-medium" style={{ color: textPrimary }}>{selectedMember.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Work Stats */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>📊 Performance Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
                    <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{selectedMember.attendance}</p>
                    <p className="text-xs" style={{ color: textSecondary }}>Attendance</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
                    <p className="text-2xl font-bold" style={{ color: '#ea580c' }}>{selectedMember.leaves}</p>
                    <p className="text-xs" style={{ color: textSecondary }}>Leaves Used</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff' }}>
                    <p className="text-2xl font-bold" style={{ color: navyBlue }}>{selectedMember.tasks?.length || 0}</p>
                    <p className="text-xs" style={{ color: textSecondary }}>Active Tasks</p>
                  </div>
                </div>
              </div>

              {/* Current Tasks */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>📋 Current Tasks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.tasks && selectedMember.tasks.length > 0 ? (
                    selectedMember.tasks.map((task, i) => (
                      <span 
                        key={i}
                        className="px-3 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                      >
                        {task}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: textSecondary }}>No active tasks</p>
                  )}
                </div>
              </div>

              {/* Join Date */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <h3 className="text-sm font-bold uppercase mb-3" style={{ color: navyBlue }}>📅 Employment</h3>
                <p style={{ color: textSecondary }}>Joined: <span className="font-medium" style={{ color: textPrimary }}>{selectedMember.joinDate}</span></p>
              </div>

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowViewModal(false); handleAssignTask(selectedMember); }}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ 
                    background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
                  }}
                >
                  📋 Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-xl animate-scale-in"
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
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    📋
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Assign Task</h2>
                    <p className="text-purple-200 text-sm">Assign a task to {selectedMember.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTaskModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Assignee Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold" style={{ color: textPrimary }}>{selectedMember.name}</p>
                  <p className="text-sm" style={{ color: textSecondary }}>{selectedMember.role} • {selectedMember.dept}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📌 Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📝 Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Describe the task..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📅 Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🚨 Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTask}
                  disabled={!taskForm.title}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  ✅ Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
