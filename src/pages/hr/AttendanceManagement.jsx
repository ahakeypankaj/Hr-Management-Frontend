import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

// Mock logged-in employees data
const mockLoggedInEmployees = [
  { 
    id: "EMP001", 
    name: "Asha Kumar", 
    email: "asha@company.com", 
    department: "Engineering",
    designation: "Senior Developer",
    checkInTime: "09:15 AM",
    checkOutTime: "-",
    status: "Present",
    avatar: "A"
  },
  { 
    id: "EMP002", 
    name: "Ravi Sharma", 
    email: "ravi@company.com", 
    department: "HR",
    designation: "HR Manager",
    checkInTime: "09:00 AM",
    checkOutTime: "-",
    status: "Present",
    avatar: "R"
  },
  { 
    id: "EMP003", 
    name: "Priya Patel", 
    email: "priya@company.com", 
    department: "Engineering",
    designation: "UI/UX Designer",
    checkInTime: "09:30 AM",
    checkOutTime: "-",
    status: "Present",
    avatar: "P"
  },
  { 
    id: "EMP004", 
    name: "Vikram Singh", 
    email: "vikram@company.com", 
    department: "DevOps",
    designation: "DevOps Engineer",
    checkInTime: "08:45 AM",
    checkOutTime: "-",
    status: "Present",
    avatar: "V"
  },
  { 
    id: "EMP005", 
    name: "Anita Verma", 
    email: "anita@company.com", 
    department: "QA",
    designation: "QA Lead",
    checkInTime: "09:20 AM",
    checkOutTime: "06:15 PM",
    status: "Checked Out",
    avatar: "A"
  },
  { 
    id: "EMP006", 
    name: "Rahul Gupta", 
    email: "rahul@company.com", 
    department: "Sales",
    designation: "Sales Executive",
    checkInTime: "-",
    checkOutTime: "-",
    status: "Optional Holiday",
    avatar: "R"
  },
  { 
    id: "EMP007", 
    name: "Sneha Reddy", 
    email: "sneha@company.com", 
    department: "Finance",
    designation: "Finance Manager",
    checkInTime: "-",
    checkOutTime: "-",
    status: "Holiday",
    avatar: "S"
  },
];

const departments = ["All", "Engineering", "DevOps", "QA", "Sales", "Product", "Finance", "HR"];
const statusOptions = ["All", "Present", "Checked Out", "On Leave", "Holiday", "Optional Holiday"];
const ITEMS_PER_PAGE = 10;

export default function AttendanceManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [employees, setEmployees] = useState(mockLoggedInEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || employee.department === filterDept;
    const matchesStatus = filterStatus === "All" || employee.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present": return { bg: "#dcfce7", color: "#16a34a", icon: "🟢" };
      case "Checked Out": return { bg: "#dbeafe", color: "#2563eb", icon: "🔵" };
      case "On Leave": return { bg: "#fef3c7", color: "#d97706", icon: "🟡" };
      case "Holiday": return { bg: "#dbeafe", color: "#2563eb", icon: "🎊" };
      case "Optional Holiday": return { bg: "#e9d5ff", color: "#9333ea", icon: "🎉" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "⚪" };
    }
  };

  // Stats
  const stats = [
    { label: "Total Employees", value: employees.length, color: "#2563eb", icon: "👥" },
    { label: "Present", value: employees.filter(e => e.status === "Present").length, color: "#16a34a", icon: "🟢" },
    { label: "Checked Out", value: employees.filter(e => e.status === "Checked Out").length, color: "#2563eb", icon: "🔵" },
    { label: "On Leave", value: employees.filter(e => e.status === "On Leave").length, color: "#d97706", icon: "🟡" },
    { label: "Holiday", value: employees.filter(e => e.status === "Holiday").length, color: "#2563eb", icon: "🎊" },
    { label: "Opt. Holiday", value: employees.filter(e => e.status === "Optional Holiday").length, color: "#9333ea", icon: "🎉" },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>Attendance Management</h1>
          <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Track employee attendance and check-in status</p>
        </div>
        <div 
          className="text-right px-5 py-3 rounded-xl"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 50%, #3b82f6 100%)`,
          }}
        >
          <p className="text-sm text-blue-100">Today</p>
          <p className="text-lg font-bold text-white">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-fade-in-up">
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
            Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
          </span>
        </div>
      </div>

      {/* Employees List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div 
          className="p-5"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
          }}
        >
          <h2 className="text-lg font-bold text-white">Employee Attendance Status</h2>
        </div>

        {paginatedEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-4">👥</span>
            <p className="font-semibold" style={{ color: textPrimary }}>No employees found</p>
            <p className="text-sm" style={{ color: textSecondary }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <tr>
                  {["Employee", "Department", "Check In", "Check Out", "Status"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((employee, index) => {
                  const statusStyle = getStatusStyle(employee.status);
                  return (
                    <tr 
                      key={employee.id}
                      className="hover:bg-opacity-50 transition-all"
                      style={{ 
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        backgroundColor: isDark ? 'transparent' : 'transparent'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                            style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}
                          >
                            {employee.avatar}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: textPrimary }}>{employee.name}</p>
                            <p className="text-xs" style={{ color: textSecondary }}>{employee.email}</p>
                            <p className="text-xs" style={{ color: textSecondary }}>ID: {employee.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium" style={{ color: textPrimary }}>{employee.department}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>{employee.designation}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium" style={{ color: employee.checkInTime !== "-" ? '#16a34a' : textSecondary }}>
                          {employee.checkInTime}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium" style={{ color: employee.checkOutTime !== "-" ? '#2563eb' : textSecondary }}>
                          {employee.checkOutTime}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.icon} {employee.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    </div>
  );
}
