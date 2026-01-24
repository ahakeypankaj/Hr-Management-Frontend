import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getAttendanceDashboard, getMonthlyAttendance } from "../../services/attendanceService";

// Map API attendance data to UI format
const mapAttendanceToEmployee = (attendance) => {
  // Format time from ISO string to readable format
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Map API status to UI status
  let status = "Absent"; // Default
  
  // If checked out, status is "Checked Out"
  if (attendance.checkOutStatus === true) {
    status = "Checked Out";
  } 
  // If has check-in time but not checked out, status is "Present"
  else if (attendance.checkInTime && !attendance.checkOutStatus) {
    status = "Present";
  }
  // Map API status values
  else if (attendance.status === "onLeave") {
    status = "On Leave";
  } else if (attendance.status === "holiday") {
    status = "Holiday";
  } else if (attendance.status === "optionalHoliday") {
    status = "Optional Holiday";
  } else if (attendance.status === "absent") {
    status = "Absent";
  }

  return {
    id: attendance.user?.employeeId || attendance._id,
    _id: attendance._id,
    name: attendance.user?.name || "Unknown",
    email: attendance.user?.companyEmail || "",
    department: attendance.user?.department || "",
    designation: attendance.user?.designation || "",
    checkInTime: formatTime(attendance.checkInTime),
    checkOutTime: formatTime(attendance.checkOutTime),
    status: status,
    avatar: (attendance.user?.name || "U").charAt(0).toUpperCase(),
    totalHours: attendance.totalHours || 0,
    workMode: attendance.workMode || "office",
  };
};

export default function AttendanceManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    checkedOut: 0,
    onLeave: 0,
    holiday: 0,
    optionalHoliday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
  });

  // Calendar modal state
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Fetch attendance dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAttendanceDashboard();
        if (response.summary) {
          setSummary(response.summary);
        }
        if (response.table && response.table.data) {
          const mappedEmployees = response.table.data.map(mapAttendanceToEmployee);
          setEmployees(mappedEmployees);
        }
        if (response.table && response.table.pagination) {
          setPagination(response.table.pagination);
          setCurrentPage(response.table.pagination.page);
        }
      } catch (err) {
        console.error("Error fetching attendance dashboard:", err);
        setError(err.response?.data?.message || err.message || "Failed to load attendance data");
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Extract unique departments from employees for filter
  const departments = ["All", ...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const statusOptions = ["All", "Present", "Checked Out", "On Leave", "Holiday", "Optional Holiday", "Absent"];

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

  // Pagination - use API pagination if available, otherwise client-side
  const totalPages = pagination.totalPages || Math.ceil(filteredEmployees.length / (pagination.limit || 10));
  const paginatedEmployees = pagination.totalPages 
    ? filteredEmployees // If API pagination, use all filtered results
    : filteredEmployees.slice(
        (currentPage - 1) * (pagination.limit || 10),
        currentPage * (pagination.limit || 10)
      );

  const handleFilterChange = () => setCurrentPage(1);

  // Fetch monthly attendance data from API
  useEffect(() => {
    if (showCalendarModal) {
      const fetchMonthlyAttendance = async () => {
        setIsLoadingCalendar(true);
        try {
          // API expects month as 1-12, but JavaScript Date uses 0-11
          const apiMonth = selectedMonth + 1;
          const response = await getMonthlyAttendance(selectedYear, apiMonth);
          
          const payload = response?.data ?? response;
          if (payload?.attendance) {
            // Transform API response to calendar format; normalize status to lowercase for getStatusColor
            const attendanceData = {};
            payload.attendance.forEach((item) => {
              attendanceData[item.day] = {
                status: typeof item.status === "string" ? item.status.toLowerCase() : item.status,
                checkInTime: item.checkInTime,
                checkOutTime: item.checkOutTime,
                totalHours: item.totalHours,
                isLate: item.isLate,
                isWeekend: item.isWeekend,
                isHoliday: item.isHoliday,
                isLeave: item.isLeave,
              };
            });
            setCalendarData({
              attendanceData,
              daysInMonth: payload.daysInMonth,
              firstDayOfMonth: payload.firstDayOfMonth,
              summary: payload.summary,
            });
          }
        } catch (error) {
          console.error("Error fetching monthly attendance:", error);
          setCalendarData(null);
        } finally {
          setIsLoadingCalendar(false);
        }
      };

      fetchMonthlyAttendance();
    }
  }, [showCalendarModal, selectedMonth, selectedYear]);

  // Navigate months
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present": return { bg: "#dcfce7", color: "#16a34a", icon: "🟢" };
      case "Checked Out": return { bg: "#dbeafe", color: "#2563eb", icon: "🔵" };
      case "On Leave": return { bg: "#fef3c7", color: "#d97706", icon: "🟡" };
      case "Holiday": return { bg: "#dbeafe", color: "#2563eb", icon: "🎊" };
      case "Optional Holiday": return { bg: "#e9d5ff", color: "#9333ea", icon: "🎉" };
      case "Absent": return { bg: "#fee2e2", color: "#dc2626", icon: "🔴" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "⚪" };
    }
  };

  // Stats from API summary (no Opt. Holiday or View Calendar – calendar is a top button)
  const stats = [
    { label: "Total Employees", value: summary.totalEmployees || 0, color: "#2563eb", icon: "👥" },
    { label: "Present", value: summary.present || 0, color: "#16a34a", icon: "🟢" },
    { label: "Checked Out", value: summary.checkedOut || 0, color: "#2563eb", icon: "🔵" },
    { label: "On Leave", value: summary.onLeave || 0, color: "#d97706", icon: "🟡" },
    { label: "Holiday", value: summary.holiday || 0, color: "#2563eb", icon: "🎊" },
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in-up">
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
            Showing {paginatedEmployees.length} of {pagination.totalRecords || filteredEmployees.length} employees
          </span>
        </div>
      </div>

      {/* Employees List */}
      {!isLoading && !error && (
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
                          {employee.department && <p className="font-medium" style={{ color: textPrimary }}>{employee.department}</p>}
                          {employee.designation && <p className="text-xs" style={{ color: textSecondary }}>{employee.designation}</p>}
                          {!employee.department && !employee.designation && <span className="text-sm" style={{ color: textSecondary }}>—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium" style={{ color: employee.checkInTime !== "-" ? '#16a34a' : textSecondary }}>
                          {employee.checkInTime}
                        </p>
                        {employee.workMode && (
                          <p className="text-xs mt-1" style={{ color: textSecondary }}>
                            {employee.workMode === "remote" ? "🏠 Remote" : "🏢 Office"}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium" style={{ color: employee.checkOutTime !== "-" ? '#2563eb' : textSecondary }}>
                          {employee.checkOutTime}
                        </p>
                        {employee.totalHours > 0 && employee.checkOutTime !== "-" && (
                          <p className="text-xs mt-1" style={{ color: textSecondary }}>
                            {employee.totalHours.toFixed(2)} hrs
                          </p>
                        )}
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
      )}

      {/* Attendance Calendar Modal */}
      {showCalendarModal && (() => {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
        
        // Use API data if available, otherwise show loading
        const attendanceData = calendarData?.attendanceData || {};
        const daysInMonth = calendarData?.daysInMonth || new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const firstDayOfMonth = calendarData?.firstDayOfMonth || new Date(selectedYear, selectedMonth, 1).getDay();
        
        const getStatusColor = (status) => {
          switch (status) {
            case 'present': return { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' };
            case 'late': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
            case 'absent': return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
            case 'weekend': return { bg: isDark ? '#334155' : '#f1f5f9', text: isDark ? '#94a3b8' : '#64748b', border: isDark ? '#475569' : '#e2e8f0' };
            case 'half-day': return { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' };
            case 'leave': return { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' };
            default: return { bg: isDark ? '#334155' : '#f8fafc', text: textSecondary, border: isDark ? '#475569' : '#e2e8f0' };
          }
        };

        return (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowCalendarModal(false)}
          >
            <div
              className="w-full max-w-4xl animate-scale-in"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="p-6 border-b"
                style={{
                  background: `linear-gradient(135deg, ${navyBlue}, #2563eb)`,
                  borderColor: isDark ? '#334155' : '#e2e8f0'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePreviousMonth}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      ←
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{monthNames[selectedMonth]} {selectedYear}</h2>
                    </div>
                    <button
                      onClick={handleNextMonth}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCalendarModal(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Calendar Body */}
              <div className="p-6">
                {isLoadingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-4" style={{ color: textPrimary }}>Loading calendar data...</span>
                  </div>
                ) : (
                  <>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Late (after 9:30 AM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Half Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Weekend</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-sm py-2"
                      style={{ color: textSecondary }}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayData = attendanceData[day];
                    const statusColors = getStatusColor(dayData?.status);
                    const isToday = isCurrentMonth && today.getDate() === day;
                    let formattedCheckInTime = null;
                    if (dayData?.checkInTime) {
                      try {
                        const d = new Date(dayData.checkInTime);
                        formattedCheckInTime = Number.isNaN(d.getTime())
                          ? String(dayData.checkInTime)
                          : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                      } catch {
                        formattedCheckInTime = String(dayData.checkInTime);
                      }
                    }
                    const isLate = dayData?.isLate || dayData?.status === "late";
                    const title = dayData?.status === "weekend"
                      ? "Weekend"
                      : dayData?.status === "leave"
                        ? "Leave"
                        : dayData?.status === "absent"
                          ? "Absent"
                          : formattedCheckInTime
                            ? `Check-in: ${formattedCheckInTime}${dayData?.totalHours != null ? ` | Hours: ${Number(dayData.totalHours).toFixed(2)}h` : ""}`
                            : "No check-in";

                    return (
                      <div
                        key={day}
                        className="aspect-square p-1 rounded-lg transition-all hover:scale-105"
                        style={{
                          backgroundColor: statusColors.bg,
                          border: `2px solid ${isToday ? "#2563eb" : statusColors.border}`,
                          cursor: dayData?.status && dayData.status !== "weekend" ? "pointer" : "default",
                          minHeight: "60px",
                        }}
                        title={title}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-sm font-bold" style={{ color: statusColors.text }}>
                            {day}
                          </span>
                          {formattedCheckInTime && (
                            <span className="text-[9px] mt-0.5" style={{ color: statusColors.text }}>
                              {formattedCheckInTime}
                            </span>
                          )}
                          {isLate && (
                            <span className="text-[10px] mt-0.5" style={{ color: "#d97706" }}>⚠️</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
