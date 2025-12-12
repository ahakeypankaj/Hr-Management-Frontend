import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DonutChart from "../../components/charts/DonutChart";

const mockHistory = [
  { id: 1, date: "2024-12-12", checkIn: "09:00 AM", checkOut: "06:15 PM", status: "Present", hours: "9h 15m" },
  { id: 2, date: "2024-12-11", checkIn: "08:45 AM", checkOut: "06:00 PM", status: "Present", hours: "9h 15m" },
  { id: 3, date: "2024-12-10", checkIn: "09:30 AM", checkOut: "06:30 PM", status: "Present", hours: "9h 00m" },
  { id: 4, date: "2024-12-09", checkIn: "-", checkOut: "-", status: "Leave", hours: "-" },
  { id: 5, date: "2024-12-08", checkIn: "-", checkOut: "-", status: "Weekend", hours: "-" },
  { id: 6, date: "2024-12-07", checkIn: "-", checkOut: "-", status: "Weekend", hours: "-" },
  { id: 7, date: "2024-12-06", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", hours: "9h 00m" },
  { id: 8, date: "2024-12-05", checkIn: "09:15 AM", checkOut: "06:30 PM", status: "Present", hours: "9h 15m" },
  { id: 9, date: "2024-12-04", checkIn: "08:50 AM", checkOut: "05:45 PM", status: "Present", hours: "8h 55m" },
  { id: 10, date: "2024-12-03", checkIn: "09:05 AM", checkOut: "06:20 PM", status: "Present", hours: "9h 15m" },
  { id: 11, date: "2024-12-02", checkIn: "-", checkOut: "-", status: "Absent", hours: "-" },
  { id: 12, date: "2024-12-01", checkIn: "-", checkOut: "-", status: "Weekend", hours: "-" },
  { id: 13, date: "2024-11-30", checkIn: "-", checkOut: "-", status: "Weekend", hours: "-" },
  { id: 14, date: "2024-11-29", checkIn: "09:10 AM", checkOut: "06:00 PM", status: "Present", hours: "8h 50m" },
  { id: 15, date: "2024-11-28", checkIn: "09:00 AM", checkOut: "06:30 PM", status: "Present", hours: "9h 30m" },
  { id: 16, date: "2024-11-27", checkIn: "08:55 AM", checkOut: "06:15 PM", status: "Present", hours: "9h 20m" },
  { id: 17, date: "2024-11-26", checkIn: "-", checkOut: "-", status: "Leave", hours: "-" },
  { id: 18, date: "2024-11-25", checkIn: "09:20 AM", checkOut: "06:00 PM", status: "Present", hours: "8h 40m" },
];

const monthlyStats = { present: 18, absent: 1, leaves: 2, holidays: 1, workingDays: 22 };
const statusOptions = ["All", "Present", "Absent", "Leave", "Weekend"];
const ITEMS_PER_PAGE = 5;

export default function Attendance() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [message, setMessage] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMonth, setFilterMonth] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const colors = {
    primary: '#1e3a5f',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
  };

  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
    boxShadow: isDark ? 'none' : '0 4px 20px rgba(30, 58, 95, 0.08)',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  // Filter history
  const filteredHistory = mockHistory.filter(record => {
    if (filterStatus !== "All" && record.status !== filterStatus) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  const handleCheckIn = () => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
    setMessage({ type: "success", text: `Checked in at ${now.toLocaleTimeString()}` });
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setMessage({ type: "success", text: `Checked out at ${new Date().toLocaleTimeString()}` });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present": return { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", color: "#16a34a" };
      case "Leave": return { bg: "linear-gradient(135deg, #ffedd5, #fed7aa)", color: "#ea580c" };
      case "Absent": return { bg: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#dc2626" };
      case "Weekend": return { bg: isDark ? "#334155" : "#f1f5f9", color: isDark ? "#94a3b8" : "#64748b" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const attendancePercentage = Math.round((monthlyStats.present / monthlyStats.workingDays) * 100);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Attendance</h1>
          <p style={{ color: textSecondary }}>Track your daily attendance and view history</p>
        </div>
        <div 
          className="text-right px-5 py-3 rounded-xl"
          style={{ background: colors.gradient }}
        >
          <p className="text-sm text-blue-100">Today</p>
          <p className="text-lg font-bold text-white">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Check In/Out Card */}
      <div className="p-6 animate-fade-in-up hover-lift" style={cardStyle}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold" style={{ color: textPrimary }}>Mark Your Attendance</h2>
            <p style={{ color: textSecondary }} className="mt-1">
              {isCheckedIn ? `You checked in at ${checkInTime?.toLocaleTimeString()}` : "You haven't checked in yet today"}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              className="px-8 py-4 rounded-xl font-bold transition-all text-white flex items-center gap-2"
              style={{ 
                background: isCheckedIn ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: isCheckedIn ? (isDark ? '#64748b' : '#94a3b8') : '#ffffff',
                cursor: isCheckedIn ? 'not-allowed' : 'pointer',
                boxShadow: isCheckedIn ? 'none' : '0 4px 15px rgba(22, 163, 74, 0.4)'
              }}
            >
              <span className="text-xl">🟢</span> Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn}
              className="px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
              style={{ 
                background: !isCheckedIn ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: !isCheckedIn ? (isDark ? '#64748b' : '#94a3b8') : '#ffffff',
                cursor: !isCheckedIn ? 'not-allowed' : 'pointer',
                boxShadow: !isCheckedIn ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.4)'
              }}
            >
              <span className="text-xl">🔴</span> Check Out
            </button>
          </div>
        </div>
        {message && (
          <div
            className="mt-4 p-4 rounded-xl font-medium animate-fade-in-up"
            style={{ 
              background: message.type === "success" ? "linear-gradient(135deg, #dcfce7, #bbf7d0)" : "linear-gradient(135deg, #fee2e2, #fecaca)",
              color: message.type === "success" ? "#16a34a" : "#dc2626"
            }}
          >
            ✓ {message.text}
          </div>
        )}
      </div>

      {/* Monthly Overview - Compact Layout */}
      <div className="p-5 animate-fade-in-up" style={cardStyle}>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Attendance Chart - Left */}
          <div className="flex items-center gap-4">
            <DonutChart 
              percentage={attendancePercentage} 
              size={100} 
              strokeWidth={12} 
              color="#16a34a" 
              label="Attendance"
            />
            <div>
              <h3 className="font-bold text-lg" style={{ color: textPrimary }}>Monthly Overview</h3>
              <p className="text-sm" style={{ color: textSecondary }}>
                {monthlyStats.present}/{monthlyStats.workingDays} days attended
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px h-16" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />

          {/* Stats Row - Right */}
          <div className="flex-1 w-full grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {[
              { label: "Present", value: monthlyStats.present, color: "#16a34a", bg: "#dcfce7" },
              { label: "Absent", value: monthlyStats.absent, color: "#dc2626", bg: "#fee2e2" },
              { label: "Leaves", value: monthlyStats.leaves, color: "#ea580c", bg: "#ffedd5" },
              { label: "Holidays", value: monthlyStats.holidays, color: "#2563eb", bg: "#dbeafe" },
              { label: "Total", value: monthlyStats.workingDays, color: "#1e3a5f", bg: "#f1f5f9" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:scale-[1.02]"
                style={{ backgroundColor: isDark ? '#334155' : stat.bg }}
              >
                <div 
                  className="text-lg sm:text-2xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-[10px] sm:text-xs font-medium leading-tight"
                  style={{ color: isDark ? '#94a3b8' : stat.color }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Month:</span>
          <select
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="all">All Months</option>
            <option value="dec">December 2024</option>
            <option value="nov">November 2024</option>
            <option value="oct">October 2024</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <span className="text-sm" style={{ color: textSecondary }}>
          Showing {paginatedHistory.length} of {filteredHistory.length} records
        </span>
      </div>

      {/* Attendance History */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-3">
        <div 
          className="p-6"
          style={{ 
            background: colors.gradient,
            borderBottom: 'none'
          }}
        >
          <h2 className="text-lg font-bold text-white">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
              <tr>
                {["Date", "Check In", "Check Out", "Hours", "Status"].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="text-4xl block mb-2">📋</span>
                    <p style={{ color: textSecondary }}>No records found</p>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((record, index) => {
                  const statusStyle = getStatusStyle(record.status);
                  return (
                    <tr 
                      key={record.id}
                      className="hover:bg-opacity-50 transition-all"
                      style={{ 
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: textPrimary }}>{record.date}</td>
                      <td className="px-6 py-4" style={{ color: textSecondary }}>{record.checkIn}</td>
                      <td className="px-6 py-4" style={{ color: textSecondary }}>{record.checkOut}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#2563eb' }}>{record.hours}</td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-4 py-1.5 rounded-full text-xs font-bold"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
        >
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm mr-2" style={{ color: textSecondary }}>
              Page {currentPage} of {totalPages}
            </span>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-9 h-9 rounded-lg font-medium transition-all text-sm"
                style={{ 
                  backgroundColor: currentPage === page ? colors.primary : (isDark ? '#334155' : '#f1f5f9'),
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
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 hover:opacity-80"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
