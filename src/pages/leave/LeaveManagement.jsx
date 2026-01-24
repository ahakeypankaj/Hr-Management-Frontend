import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { applyLeave, getLeaveSummary, getMyLeaveApplications, getTeamLeaveCalendar } from "../../services/leaveService";

// Leave type configuration with colors and icons for all possible leave types
const leaveTypeConfig = {
  casual: { color: "#60a5fa", icon: "🏖️", label: "Casual" },
  vacation: { color: "#a78bfa", icon: "✈️", label: "Vacation" },
  sick: { color: "#f87171", icon: "🏥", label: "Sick" },
};

const ITEMS_PER_PAGE = 10;

export default function LeaveManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isHRManager = user?.role === "hr_manager" || user?.role === "admin";
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showTeamCalendarModal, setShowTeamCalendarModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [allLeaveHistory, setAllLeaveHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Calendar state for team leave calendar
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  // Fetch leave balances from API
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      setIsLoadingBalances(true);
      setBalanceError(null);
      try {
        const response = await getLeaveSummary();
        const data = response.data.data;
        console.log("data leave balances", data);

        
        // Map API response to component format - include only casual, vacation, and sick leave types
        const balances = [
          {
            type: "casual",
            total: data.casualLeave?.total || 0,
            used: data.casualLeave?.used || 0,
            pending: data.casualLeave?.pending || 0,
            left: data.casualLeave?.left || 0,
            ...leaveTypeConfig.casual
          },
          {
            type: "vacation",
            total: data.vacationLeave?.total || 0,
            used: data.vacationLeave?.used || 0,
            pending: data.vacationLeave?.pending || 0,
            left: data.vacationLeave?.left || 0,
            ...leaveTypeConfig.vacation
          },
          {
            type: "sick",
            total: data.sickLeave?.total || 0,
            used: data.sickLeave?.used || 0,
            pending: data.sickLeave?.pending || 0,
            left: data.sickLeave?.left || 0,
            ...leaveTypeConfig.sick
          },
        ];
        
        setLeaveBalances(balances);
      } catch (error) {
        console.error("Error fetching leave balances:", error);
        setBalanceError("Failed to load leave balances. Please try again.");
        setLeaveBalances([]);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchLeaveBalances();
  }, []);

  // Fetch leave history from API
  useEffect(() => {
    const fetchLeaveHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await getMyLeaveApplications();
        console.log("Leave applications API response:", response);
        
        // Handle different API response structures
        let applications = [];
        if (response?.data?.data) {
          applications = response.data.data;
        } else if (response?.data) {
          applications = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          applications = response;
        }
        
        console.log("Parsed applications:", applications);
        
        // Map API response to component format
        const mappedHistory = applications.map((app, index) => ({
          id: app._id,
          type: app.leaveType,
          startDate: app.startDate ? new Date(app.startDate).toISOString().split('T')[0] : '',
          endDate: app.endDate ? new Date(app.endDate).toISOString().split('T')[0] : '',
          days: app.totalDays || 0,
          reason: app.reason || '',
          status: app.status || 'pending', // approved, rejected, pending, cancelled
          appliedOn: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '',
          managerComment: app.comments || "",
          rejectReason: app.rejectionReason || "",
          attachment: app.attachment || null,
        }));
        
        console.log("Mapped leave history:", mappedHistory);
        setAllLeaveHistory(mappedHistory);
      } catch (error) {
        console.error("Error fetching leave history:", error);
        console.error("Error details:", error.response?.data || error.message);
        setAllLeaveHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchLeaveHistory();
  }, []);

  // Generate allLeaveTypes from leaveBalances for dropdowns (only when balances are loaded)
  const allLeaveTypes = leaveBalances.length > 0 ? leaveBalances.map(balance => ({
    type: balance.type,
    total: balance.total,
    used: balance.used,
    pending: balance.pending,
    color: balance.color,
    icon: balance.icon,
  })) : [];

  // Filter leave history
  const filteredHistory = allLeaveHistory.filter(leave => {
    if (filterType !== "all" && leave.type !== filterType) return false;
    if (filterStatus !== "all" && leave.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return { bg: "#dcfce7", color: "#16a34a", label: "✓ Approved" };
      case "pending":
        return { bg: "#fef3c7", color: "#d97706", label: "⏳ Pending" };
      case "rejected":
        return { bg: "#fee2e2", color: "#dc2626", label: "✗ Rejected" };
      default:
        return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleApply = async () => {
    // Validation
    if (!leaveForm.leaveType) {
      setSubmitError("Please select a leave type");
      return;
    }
    if (!leaveForm.startDate) {
      setSubmitError("Please select a start date");
      return;
    }
    if (!leaveForm.endDate) {
      setSubmitError("Please select an end date");
      return;
    }
    if (!leaveForm.reason.trim()) {
      setSubmitError("Please provide a reason");
      return;
    }
    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      setSubmitError("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const leaveData = {
        leaveType: leaveForm.leaveType,
        startDate: formatDateForAPI(leaveForm.startDate),
        endDate: formatDateForAPI(leaveForm.endDate),
        reason: leaveForm.reason,
        attachment: leaveForm.attachment,
      };

      await applyLeave(leaveData);

      // Success
      alert("Leave applied successfully!");
      setShowApplyModal(false);
      setLeaveForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        attachment: null,
      });
      setSubmitError(null);
      // Refresh leave balances and history
      const summaryResponse = await getLeaveSummary();
      const data = summaryResponse.data.data;
      const balances = [
        {
          type: "casual",
          total: data.casualLeave?.total || 0,
          used: data.casualLeave?.used || 0,
          pending: data.casualLeave?.pending || 0,
          left: data.casualLeave?.left || 0,
          ...leaveTypeConfig.casual
        },
        {
          type: "vacation",
          total: data.vacationLeave?.total || 0,
          used: data.vacationLeave?.used || 0,
          pending: data.vacationLeave?.pending || 0,
          left: data.vacationLeave?.left || 0,
          ...leaveTypeConfig.vacation
        },
        {
          type: "sick",
          total: data.sickLeave?.total || 0,
          used: data.sickLeave?.used || 0,
          pending: data.sickLeave?.pending || 0,
          left: data.sickLeave?.left || 0,
          ...leaveTypeConfig.sick
        },
      ];
      setLeaveBalances(balances);

      // Refresh leave history
      const historyResponse = await getMyLeaveApplications();
      const applications = historyResponse.data.data || [];
      const mappedHistory = applications.map((app) => ({
        id: app._id,
        type: app.leaveType,
        startDate: new Date(app.startDate).toISOString().split('T')[0],
        endDate: new Date(app.endDate).toISOString().split('T')[0],
        days: app.totalDays,
        reason: app.reason,
        status: app.status,
        appliedOn: new Date(app.createdAt).toISOString().split('T')[0],
        managerComment: app.comments || "",
        rejectReason: app.rejectionReason || "",
        attachment: app.attachment || null,
      }));
      setAllLeaveHistory(mappedHistory);
    } catch (error) {
      console.error("Error applying leave:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to apply leave. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (id) => {
    alert(`Leave request ${id} cancelled`);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Build calendar structure from API leaves (startDate/endDate ISO, userId, leaveType, status)
  const buildCalendarFromLeaves = (leaves, year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const cal = {};
    for (let day = 1; day <= daysInMonth; day++) cal[day] = [];
    (leaves || []).forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const user = leave.userId || {};
      const entry = {
        employeeId: user._id || user.employeeId,
        employeeName: user.name || "Unknown",
        department: user.department || "",
        leaveType: leave.leaveType || "casual",
        status: leave.status || "pending",
      };
      const cursor = new Date(start);
      while (cursor <= end) {
        if (cursor.getFullYear() === year && cursor.getMonth() === month) {
          const d = cursor.getDate();
          cal[d].push(entry);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return { calendarData: cal, daysInMonth, firstDayOfMonth };
  };

  // Fetch team leave calendar from API when modal opens or month/year changes
  useEffect(() => {
    if (!isHRManager || !showTeamCalendarModal) return;
    const fetchCalendar = async () => {
      setIsLoadingCalendar(true);
      setCalendarError(null);
      try {
        const res = await getTeamLeaveCalendar(selectedYear, selectedMonth);
        const payload = res?.data ?? res;
        const leaves = payload?.leaves ?? [];
        const { calendarData: cal, daysInMonth, firstDayOfMonth } = buildCalendarFromLeaves(leaves, selectedYear, selectedMonth);
        setCalendarData({ calendarData: cal, daysInMonth, firstDayOfMonth });
      } catch (err) {
        console.error("Error fetching team leave calendar:", err);
        setCalendarError(err?.response?.data?.message || err?.message || "Failed to load team calendar.");
        setCalendarData(null);
      } finally {
        setIsLoadingCalendar(false);
      }
    };
    fetchCalendar();
  }, [isHRManager, showTeamCalendarModal, selectedMonth, selectedYear]);

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

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Leave Management</h1>
          <p style={{ color: textSecondary }}>View balances, apply for leave, and track requests</p>
        </div>
        <div className="flex gap-3">
          {isHRManager && (
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(now.getMonth());
                setSelectedYear(now.getFullYear());
                setShowTeamCalendarModal(true);
              }}
              className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: '#0891b2', boxShadow: '0 4px 15px rgba(8, 145, 178, 0.4)' }}
            >
              📅 Team Calendar
            </button>
          )}
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
          >
            ➕ Apply Leave
          </button>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
        {isLoadingBalances ? (
          // Loading state
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 animate-pulse" style={cardStyle}>
              <div className="h-8 bg-gray-300 rounded mb-3" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}></div>
              <div className="h-6 bg-gray-300 rounded mb-2" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}></div>
              <div className="h-2 bg-gray-300 rounded" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}></div>
            </div>
          ))
        ) : balanceError ? (
          // Error state
          <div className="col-span-full p-4 rounded-xl" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
            <p className="text-sm font-medium" style={{ color: '#dc2626' }}>⚠️ {balanceError}</p>
          </div>
        ) : (
          leaveBalances.map((leave, i) => {
            const available = leave.left !== undefined ? leave.left : (leave.total === -1 ? "Unlimited" : (leave.total - leave.used - leave.pending));
            // Calculate percentage and ensure it doesn't exceed 100%
            const percentage = leave.total === -1 || leave.total === 0 ? 0 : Math.min(100, ((leave.used + leave.pending) / leave.total) * 100);
            const displayName = leave.label || leave.type.charAt(0).toUpperCase() + leave.type.slice(1);

          return (
            <div key={i} className="p-5 hover:scale-[1.02] transition-all" style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{leave.icon}</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${leave.color}20`, color: leave.color }}
                >
                  {available} {leave.total === -1 ? "" : "left"}
                </span>
              </div>
              <h3 className="font-bold" style={{ color: textPrimary }}>{displayName}</h3>

              {/* Progress Bar */}
              {leave.total !== -1 && leave.total > 0 && (
                <div className="mt-3 mb-2">
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, percentage)}%`, maxWidth: '100%', backgroundColor: leave.color }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-xs" style={{ color: textSecondary }}>
                <span>Used: {leave.used}</span>
                <span>Pending: {leave.pending}</span>
                <span>Total: {leave.total === -1 ? "∞" : leave.total}</span>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Filter by Type:</span>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              handleFilterChange();
            }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
                  <option value="all">All Types</option>
            {Object.keys(leaveTypeConfig).map((type, i) => {
              const config = leaveTypeConfig[type];
              return (
                <option key={i} value={type}>{config.label}</option>
              );
            })}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <span className="text-sm" style={{ color: textSecondary }}>
          Showing {paginatedHistory.length} of {filteredHistory.length} records
        </span>
      </div>

      {/* Leave History */}
      <div className="animate-fade-in-up stagger-2" style={cardStyle}>
        <div className="p-6" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Leave History</h2>
        </div>
        <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          {isLoadingHistory ? (
            <div className="p-8 text-center">
              <span className="text-4xl block mb-2 animate-pulse">⏳</span>
              <p style={{ color: textSecondary }}>Loading leave history...</p>
            </div>
          ) : paginatedHistory.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl block mb-2">📋</span>
              <p style={{ color: textSecondary }}>No leave records found</p>
            </div>
          ) : (
            paginatedHistory.map((leave) => {
              const statusStyle = getStatusStyle(leave.status);
              return (
                <div
                  key={leave.id}
                  className="p-6 hover:bg-opacity-50 transition-all cursor-pointer"
                  onClick={() => setSelectedLeave(selectedLeave?.id === leave.id ? null : leave)}
                  style={{ backgroundColor: selectedLeave?.id === leave.id ? (isDark ? '#334155' : '#f8fafc') : 'transparent' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${leaveTypeConfig[leave.type]?.color || navyBlue}20` }}
                      >
                        {leaveTypeConfig[leave.type]?.icon || "📅"}
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: textPrimary }}>
                          {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                        </h3>
                        <p className="text-sm" style={{ color: textSecondary }}>
                          {leave.startDate} {leave.startDate !== leave.endDate && `to ${leave.endDate}`} • {leave.days} day{leave.days > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="px-4 py-1.5 rounded-full text-sm font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                      {(leave.status === "pending" || leave.status === "Pending") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(leave.id);
                          }}
                          className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                        >
                          Cancel
                        </button>
                      )}
                      <span className="text-xl">{selectedLeave?.id === leave.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedLeave?.id === leave.id && (
                    <div className="mt-4 pt-4 animate-fade-in-up" style={{ borderTop: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium" style={{ color: textSecondary }}>Reason</p>
                          <p style={{ color: textPrimary }}>{leave.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: textSecondary }}>Applied On</p>
                          <p style={{ color: textPrimary }}>{leave.appliedOn}</p>
                        </div>
                        {(leave.status === "rejected" || leave.status === "Rejected") && leave.rejectReason && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#dc2626' }}>
                              ❌ Rejection Reason
                            </p>
                            <p
                              className="p-3 rounded-lg mt-1"
                              style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
                            >
                              {leave.rejectReason}
                            </p>
                          </div>
                        )}
                        {leave.managerComment && leave.status !== "rejected" && leave.status !== "Rejected" && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium" style={{ color: textSecondary }}>Manager Comment</p>
                            <p
                              className="p-3 rounded-lg mt-1"
                              style={{ backgroundColor: isDark ? '#0f172a' : '#f1f5f9', color: textPrimary }}
                            >
                              "{leave.managerComment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
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
            {/* Modal Header */}
            <div className="p-6" style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    🏖️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
                    <p className="text-blue-200 text-sm">Submit your leave request for approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📋 Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select leave type</option>
                  {allLeaveTypes.map((l, i) => {
                    const available = l.total === -1 ? "Unlimited" : (l.total - l.used - l.pending);
                    const displayName = leaveTypeConfig[l.type]?.label || l.type.charAt(0).toUpperCase() + l.type.slice(1);
                    return (
                      <option key={i} value={l.type}>
                        {displayName} {l.total !== -1 && `(${available} available)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📅 Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📅 End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📝 Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Enter reason for leave..."
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📎 Attachment (Optional)</label>
                <label
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `2px dashed ${isDark ? '#475569' : '#cbd5e1'}` }}
                >
                  <span className="text-3xl">📤</span>
                  <span className="font-medium" style={{ color: textPrimary }}>Click to upload document</span>
                  <span className="text-xs" style={{ color: textSecondary }}>PDF, DOC, DOCX, JPG, PNG (Max 5MB)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setLeaveForm({ ...leaveForm, attachment: e.target.files[0] })}
                  />
                </label>
                {leaveForm.attachment && (
                  <div className="mt-3 p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: `${navyBlue}15` }}>
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="font-medium" style={{ color: navyBlue }}>{leaveForm.attachment.name}</span>
                    </div>
                    <button
                      onClick={() => setLeaveForm({ ...leaveForm, attachment: null })}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium" style={{ color: '#dc2626' }}>{submitError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`, boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)' }}
                >
                  {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Leave Calendar Modal - HR/Admin Only */}
      {isHRManager && showTeamCalendarModal && (() => {
        const cal = calendarData?.calendarData || {};
        const daysInMonth = calendarData?.daysInMonth ?? new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const firstDayOfMonth = calendarData?.firstDayOfMonth ?? new Date(selectedYear, selectedMonth, 1).getDay();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

        return (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowTeamCalendarModal(false)}
          >
            <div
              className="w-full max-w-6xl animate-scale-in"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                maxHeight: '90vh'
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
                      <h2 className="text-2xl font-bold text-white">Team Leave Calendar</h2>
                      <p className="text-blue-100 text-sm mt-1">{monthNames[selectedMonth]} {selectedYear}</p>
                    </div>
                    <button
                      onClick={handleNextMonth}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTeamCalendarModal(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Calendar Body */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                {isLoadingCalendar ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-4" style={{ color: textPrimary }}>Loading team calendar…</span>
                  </div>
                ) : calendarError ? (
                  <div className="flex flex-col items-center justify-center py-16" style={{ color: textSecondary }}>
                    <p className="font-medium" style={{ color: textPrimary }}>{calendarError}</p>
                    <p className="text-sm mt-2">Try another month or check your connection.</p>
                  </div>
                ) : (
                  <>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  {Object.entries(leaveTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: `${config.color}40`, border: `1px solid ${config.color}` }}></div>
                      <span className="text-sm" style={{ color: textPrimary }}>{config.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2" style={{ borderColor: '#d97706', backgroundColor: '#fef3c7' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Overlapping</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
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
                    const dayLeaves = cal[day] || [];
                    const isToday = isCurrentMonth && today.getDate() === day;
                    const isOverlapping = dayLeaves.length > 1;
                    const hasLeaves = dayLeaves.length > 0;

                    // No background color for day cells
                    let dayColor = 'transparent';
                    let borderColor = isDark ? '#475569' : '#e2e8f0';

                    return (
                      <div
                        key={day}
                        className="aspect-square p-1 rounded-lg transition-all hover:scale-105 relative"
                        style={{
                          backgroundColor: dayColor,
                          border: `2px solid ${isToday ? '#2563eb' : borderColor}`,
                          cursor: hasLeaves ? 'pointer' : 'default',
                          minHeight: '60px'
                        }}
                        title={hasLeaves ? `${dayLeaves.length} employee(s) on leave` : 'No leaves'}
                      >
                        <div className="flex flex-col h-full">
                          <span
                            className="text-sm font-bold mb-1"
                            style={{ color: hasLeaves ? textPrimary : textSecondary }}
                          >
                            {day}
                          </span>
                          {hasLeaves && (
                            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
                              {dayLeaves.map((leave, idx) => {
                                const config = leaveTypeConfig[leave.leaveType] || leaveTypeConfig.casual;
                                return (
                                  <div
                                    key={idx}
                                    className="text-[9px] px-1 py-0.5 rounded truncate"
                                    style={{ 
                                      color: config.color
                                    }}
                                    title={`${leave.employeeName} - ${config.label} (${leave.status})`}
                                  >
                                    {leave.employeeName.split(' ')[0]}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {isOverlapping && (
                            <span className="absolute top-1 right-1 text-[10px]" style={{ color: '#d97706' }}>⚠️</span>
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
