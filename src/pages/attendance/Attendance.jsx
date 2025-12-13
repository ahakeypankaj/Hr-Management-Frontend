import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DonutChart from "../../components/charts/DonutChart";
import { checkIn, checkOut, getAttendanceHistory, getTodayAttendance } from "../../services/attendanceService";

// Helper function to format time from ISO string
const formatTime = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Helper function to format hours from totalHours (in hours)
const formatHours = (totalHours) => {
  if (totalHours === null || totalHours === undefined || totalHours === 0) return "-";
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  if (hours === 0 && minutes === 0) return "-";
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Helper function to capitalize first letter
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const statusOptions = ["All", "Present", "Holiday", "Optional Holiday", "Leave", "Weekend"];
const ITEMS_PER_PAGE = 10;

export default function Attendance() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({ present: 0, holidays: 0, optionalHolidays: 0, leaves: 0, workingDays: 0 });

  // Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMonth, setFilterMonth] = useState("all");
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7)); // Current month in YYYY-MM format
  
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

  // Fetch today's attendance status and history from API
  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const todayResponse = await getTodayAttendance();
        const todayData = todayResponse.data;
        console.log("todayData", todayData);
        
        // Set check-in and check-out status based on API response
        if (todayData.checkInStatus && todayData.data) {
          setIsCheckedIn(true);
          setIsCheckedOut(todayData.data.checkOutStatus || false);
          if (todayData.data.checkInTime) {
            setCheckInTime(new Date(todayData.data.checkInTime));
          }
        } else {
          setIsCheckedIn(false);
          setIsCheckedOut(false);
          setCheckInTime(null);
        }
      } catch (error) {
        console.error("Error fetching today's attendance:", error);
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime(null);
      }
    };

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await getAttendanceHistory();
        const historyData = response.data.data || [];
        console.log("historyData", historyData);
        
        // Map API response to component format
        const mappedHistory = historyData.map((record, index) => ({
          id: index + 1,
          date: record.date,
          checkIn: formatTime(record.checkInTime),
          checkOut: formatTime(record.checkOutTime),
          status: capitalizeFirst(record.status),
          hours: formatHours(record.totalHours),
        }));

        // Calculate monthly stats from API data
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthData = mappedHistory.filter(record => {
          const recordDate = new Date(record.date);
          const recordMonth = recordDate.toISOString().slice(0, 7);
          return recordMonth === currentMonth;
        });

        const stats = {
          present: currentMonthData.filter(r => r.status?.toLowerCase() === "present").length,
          holidays: currentMonthData.filter(r => r.status?.toLowerCase() === "holiday").length,
          optionalHolidays: currentMonthData.filter(r => r.status?.toLowerCase() === "optional holiday").length,
          leaves: currentMonthData.filter(r => r.status?.toLowerCase() === "leave").length,
          workingDays: currentMonthData.length,
        };

        setAttendanceHistory(mappedHistory);
        setMonthlyStats(stats);
      } catch (error) {
        console.error("Error fetching attendance history:", error);
        setAttendanceHistory([]);
        setMonthlyStats({ present: 0, holidays: 0, optionalHolidays: 0, leaves: 0, workingDays: 0 });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchTodayStatus();
    fetchHistory();
  }, []);

  // Filter history
  const filteredHistory = attendanceHistory.filter(record => {
    if (filterStatus !== "All" && record.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  const handleExportAttendance = () => {
    // Filter history for the selected month
    const selectedMonth = exportMonth;
    const monthData = attendanceHistory.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toISOString().slice(0, 7);
      return recordMonth === selectedMonth;
    });

    // Prepare CSV data
    const headers = ['Date', 'Day', 'Check In', 'Check Out', 'Status', 'Working Hours'];
    const csvRows = [headers.join(',')];

    monthData.forEach(record => {
      const date = new Date(record.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      
      const row = [
        formattedDate,
        dayName,
        record.checkIn,
        record.checkOut,
        record.status,
        record.hours
      ];
      csvRows.push(row.join(','));
    });

    // Add summary stats
    const presentCount = monthData.filter(r => r.status?.toLowerCase() === 'present').length;
    const leaveCount = monthData.filter(r => r.status?.toLowerCase() === 'leave').length;
    const holidayCount = monthData.filter(r => {
      const status = r.status?.toLowerCase();
      return status === 'holiday' || status === 'optional holiday';
    }).length;
    
    csvRows.push('');
    csvRows.push('Summary');
    csvRows.push(['Total Days', 'Present', 'Leave', 'Holiday'].join(','));
    csvRows.push([monthData.length, presentCount, leaveCount, holidayCount].join(','));

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with month name
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    link.setAttribute('download', `attendance_report_${monthName.replace(' ', '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setMessage({ type: 'success', text: `Attendance report for ${monthName} exported successfully!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await checkIn(true);
      const now = new Date();
      setCheckInTime(now);
      setIsCheckedIn(true);
      setMessage({ 
        type: "success", 
        text: response.data?.message || `Checked in at ${now.toLocaleTimeString()}` 
      });
      
      // Refresh today's attendance status
      const todayResponse = await getTodayAttendance();
      const todayData = todayResponse.data;
      if (todayData.checkInStatus && todayData.data) {
        setIsCheckedIn(true);
        setIsCheckedOut(todayData.data.checkOutStatus || false);
        if (todayData.data.checkInTime) {
          setCheckInTime(new Date(todayData.data.checkInTime));
        }
      }
      
      // Refresh attendance history after check-in
      const historyResponse = await getAttendanceHistory();
      const historyData = historyResponse.data.data || [];
      const mappedHistory = historyData.map((record, index) => ({
        id: index + 1,
        date: record.date,
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        status: capitalizeFirst(record.status),
        hours: formatHours(record.totalHours),
      }));
      setAttendanceHistory(mappedHistory);
    } catch (error) {
      console.error("Error checking in:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to check in. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await checkOut(true);
      const now = new Date();
      setMessage({ 
        type: "success", 
        text: response.data?.message || `Checked out at ${now.toLocaleTimeString()}` 
      });
      
      // Refresh today's attendance status
      const todayResponse = await getTodayAttendance();
      const todayData = todayResponse.data;
      if (todayData.checkInStatus && todayData.data) {
        setIsCheckedIn(true);
        setIsCheckedOut(todayData.data.checkOutStatus || false);
        if (todayData.data.checkInTime) {
          setCheckInTime(new Date(todayData.data.checkInTime));
        }
      } else {
        setIsCheckedIn(false);
        setIsCheckedOut(false);
        setCheckInTime(null);
      }
      
      // Refresh attendance history after check-out
      const historyResponse = await getAttendanceHistory();
      const historyData = historyResponse.data.data || [];
      const mappedHistory = historyData.map((record, index) => ({
        id: index + 1,
        date: record.date,
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        status: capitalizeFirst(record.status),
        hours: formatHours(record.totalHours),
      }));
      setAttendanceHistory(mappedHistory);
      
      // Update monthly stats
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthData = mappedHistory.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.toISOString().slice(0, 7);
        return recordMonth === currentMonth;
      });
      const stats = {
        present: currentMonthData.filter(r => r.status?.toLowerCase() === "present").length,
        holidays: currentMonthData.filter(r => r.status?.toLowerCase() === "holiday").length,
        optionalHolidays: currentMonthData.filter(r => r.status?.toLowerCase() === "optional holiday").length,
        leaves: currentMonthData.filter(r => r.status?.toLowerCase() === "leave").length,
        workingDays: currentMonthData.length,
      };
      setMonthlyStats(stats);
    } catch (error) {
      console.error("Error checking out:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to check out. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "present": return { bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)", color: "#16a34a" };
      case "leave": return { bg: "linear-gradient(135deg, #ffedd5, #fed7aa)", color: "#ea580c" };
      case "holiday": return { bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)", color: "#2563eb" };
      case "optional holiday": return { bg: "linear-gradient(135deg, #e9d5ff, #d8b4fe)", color: "#9333ea" };
      case "weekend": return { bg: isDark ? "#334155" : "#f1f5f9", color: isDark ? "#94a3b8" : "#64748b" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const attendancePercentage = monthlyStats.workingDays > 0 
    ? Math.round((monthlyStats.present / monthlyStats.workingDays) * 100) 
    : 0;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Attendance</h1>
          <p style={{ color: textSecondary }}>Track your daily attendance and view history</p>
        </div>
        <div className="flex flex-row items-center gap-3">
        <button
            onClick={handleExportAttendance}
            className="px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
            style={{ 
              backgroundColor: '#16a34a',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
            }}
          >
            📥 Export Report
          </button>
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
              disabled={isCheckedIn || isCheckedOut || isSubmitting}
              className="px-8 py-4 rounded-xl font-bold transition-all text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: (isCheckedIn || isCheckedOut) ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: (isCheckedIn || isCheckedOut) ? (isDark ? '#64748b' : '#94a3b8') : '#ffffff',
                cursor: (isCheckedIn || isCheckedOut || isSubmitting) ? 'not-allowed' : 'pointer',
                boxShadow: (isCheckedIn || isCheckedOut) ? 'none' : '0 4px 15px rgba(22, 163, 74, 0.4)'
              }}
            >
              {isSubmitting && !isCheckedIn ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking In...
                </>
              ) : (
                <>
                  <span className="text-xl">🟢</span> Check In
                </>
              )}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isCheckedOut || isSubmitting}
              className="px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: (!isCheckedIn || isCheckedOut) ? (isDark ? '#334155' : '#e2e8f0') : 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: (!isCheckedIn || isCheckedOut) ? (isDark ? '#64748b' : '#94a3b8') : '#ffffff',
                cursor: (!isCheckedIn || isCheckedOut || isSubmitting) ? 'not-allowed' : 'pointer',
                boxShadow: (!isCheckedIn || isCheckedOut) ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.4)'
              }}
            >
              {isSubmitting && isCheckedIn ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking Out...
                </>
              ) : (
                <>
                  <span className="text-xl">🔴</span> Check Out
                </>
              )}
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
              { label: "Holidays", value: monthlyStats.holidays, color: "#2563eb", bg: "#dbeafe" },
              // { label: "Opt. Holidays", value: monthlyStats.optionalHolidays, color: "#9333ea", bg: "#e9d5ff" },
              { label: "Leaves", value: monthlyStats.leaves, color: "#ea580c", bg: "#ffedd5" },
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

      {/* Message */}
      {message && (
        <div 
          className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in-up ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}
          style={isDark ? {
            backgroundColor: message.type === 'success' ? '#064e3b' : '#1e3a8a',
            borderColor: message.type === 'success' ? '#10b981' : '#3b82f6'
          } : {}}
        >
          <span className="text-xl">{message.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span className="font-medium" style={{ color: textPrimary }}>{message.text}</span>
        </div>
      )}

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
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Export Month:</span>
          <input
            type="month"
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          />
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
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="text-4xl block mb-2 animate-pulse">⏳</span>
                    <p style={{ color: textSecondary }}>Loading attendance history...</p>
                  </td>
                </tr>
              ) : paginatedHistory.length === 0 ? (
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
