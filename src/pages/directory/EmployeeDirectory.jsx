import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { fetchEmployees } from "../../services/directoryService";

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
    dob: user.dateOfBirth || null, // Not in API response, will be null
    profilePicture: user.profilePicture || null,
    employeeId: user.employeeId,
    employmentType: user.employmentType || "",
  };
};

const avatarColors = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #16a34a, #2563eb)",
  "linear-gradient(135deg, #ea580c, #dc2626)",
  "linear-gradient(135deg, #7c3aed, #ec4899)",
  "linear-gradient(135deg, #0891b2, #2563eb)",
  "linear-gradient(135deg, #ca8a04, #ea580c)",
];

const ITEMS_PER_PAGE = 10;

export default function EmployeeDirectory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch employees from API
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchEmployees();
        if (response.success && Array.isArray(response.users)) {
          const mappedEmployees = response.users.map(mapUserToEmployee);
          setEmployees(mappedEmployees);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Error loading employees:", err);
        setError(err.response?.data?.message || err.message || "Failed to load employees");
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Extract unique departments from employees
  const departments = ["All", ...new Set(employees.map(emp => emp.dept).filter(Boolean))];
  const statuses = ["All", ...new Set(employees.map(emp => emp.status).filter(Boolean))];

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  // Get upcoming birthdays (within next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const upcoming = employees.filter(emp => {
      if (!emp.dob) return false;
      const bday = new Date(emp.dob);
      bday.setFullYear(today.getFullYear());
      const diff = (bday - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).slice(0, 3);
    return upcoming;
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = (emp.name && emp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.id && emp.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "All" || emp.dept === selectedDept;
    const matchesStatus = selectedStatus === "All" || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "department") return a.dept.localeCompare(b.dept);
    if (sortBy === "joiningDate") return new Date(b.joiningDate) - new Date(a.joiningDate);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = () => setCurrentPage(1);

  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Employee Directory</h1>
          <p style={{ color: textSecondary }}>Browse and search all employees in the organization</p>
        </div>
        <div className="px-4 py-2 rounded-xl" style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
          <span className="font-bold text-2xl">{employees.length}</span>
          <span className="ml-2 text-sm">total employees</span>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="p-4 rounded-xl animate-fade-in-up" style={{ backgroundColor: isDark ? '#334155' : '#fef3c7', border: `1px solid ${isDark ? '#475569' : '#fcd34d'}` }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎂</span>
            <div className="flex-1">
              <p className="font-bold" style={{ color: textPrimary }}>Upcoming Birthdays</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {upcomingBirthdays.map((emp) => (
                  <span key={emp.id} className="flex items-center gap-1 text-sm" style={{ color: textSecondary }}>
                    <span className="font-medium" style={{ color: textPrimary }}>{emp.name}</span>
                    <span>({new Date(emp.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
                    <button className="ml-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: navyBlue, color: '#fff' }}>
                      🎁 Wish
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="p-4 animate-fade-in-up" style={cardStyle}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔍</span>
              <input
                type="text"
                placeholder="Search by name, role, email, or ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              {statuses.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              <option value="name">Sort: Name</option>
              <option value="department">Sort: Department</option>
              <option value="joiningDate">Sort: Joining Date</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex gap-2 flex-wrap">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => { setSelectedDept(dept); handleFilterChange(); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ 
                  backgroundColor: selectedDept === dept ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
                  color: selectedDept === dept ? '#ffffff' : textSecondary
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm" style={{ color: textSecondary }}>
        Showing {paginatedEmployees.length} of {sortedEmployees.length} employees
      </p>

      {/* Employee Cards Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
          {paginatedEmployees.map((emp) => (
            <div key={emp._id || emp.id} className="p-5 transition-all hover:scale-[1.02] hover-lift" style={cardStyle}>
            {/* Avatar and Status */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: getAvatarColor(emp.name) }}
              >
                {emp.name.charAt(0)}
              </div>
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

            {/* Employee Info */}
            <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{emp.name}</h3>
            <p className="font-semibold text-sm" style={{ color: navyBlue }}>{emp.role || "N/A"}</p>
            <p className="text-sm mt-1" style={{ color: textSecondary }}>{emp.dept || "N/A"}</p>
            <p className="text-xs mt-1 font-mono" style={{ color: textSecondary }}>{emp.employeeId || emp.id || "N/A"}</p>

            {/* Contact Info */}
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <p className="text-sm flex items-center gap-2" style={{ color: textSecondary }}>
                <span>📧</span> {emp.email}
              </p>
              <p className="text-sm flex items-center gap-2" style={{ color: textSecondary }}>
                <span>📱</span> {emp.phone}
              </p>
            </div>

            {/* View Profile Link */}
            <Link
              to={`/directory/${emp._id || emp.id}`}
              className="mt-4 block text-center py-2 rounded-lg font-semibold text-sm transition-all"
              style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
            >
              View Profile
            </Link>
          </div>
        ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            ← Previous
          </button>
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

      {/* Empty State */}
      {!isLoading && !error && paginatedEmployees.length === 0 && (
        <div className="text-center py-12" style={cardStyle}>
          <span className="text-4xl block mb-2">👥</span>
          <p className="text-lg font-medium" style={{ color: textPrimary }}>No employees found</p>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedDept("All"); setSelectedStatus("All"); }}
            className="mt-4 px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: navyBlue, color: '#fff' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
