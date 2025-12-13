import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { applyLeave, getLeaveSummary, getMyLeaveApplications } from "../../services/leaveService";

// Leave type configuration with colors and icons for all possible leave types
const leaveTypeConfig = {
  casual: { color: "#2563eb", icon: "🏖️", label: "Casual" },
  sick: { color: "#dc2626", icon: "🏥", label: "Sick" },
  vacation: { color: "#7c3aed", icon: "✈️", label: "Vacation" },
  unpaid: { color: "#f59e0b", icon: "💰", label: "Unpaid" },
  annual: { color: "#16a34a", icon: "📅", label: "Annual" },
  maternity: { color: "#ec4899", icon: "🤱", label: "Maternity" },
  paternity: { color: "#0ea5e9", icon: "👨‍👶", label: "Paternity" },
  bereavement: { color: "#64748b", icon: "🕊️", label: "Bereavement" },
};

const ITEMS_PER_PAGE = 10;

export default function LeaveManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showApplyModal, setShowApplyModal] = useState(false);
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

        
        // Map API response to component format (excluding unpaid leave from display)
        const balances = [
          {
            type: "casual",
            total: data.casualLeave.total,
            used: data.casualLeave.used,
            pending: data.casualLeave.pending,
            left: data.casualLeave.left,
            ...leaveTypeConfig.casual
          },
          {
            type: "sick",
            total: data.sickLeave.total,
            used: data.sickLeave.used,
            pending: data.sickLeave.pending,
            left: data.sickLeave.left,
            ...leaveTypeConfig.sick
          },
          {
            type: "vacation",
            total: data.vacationLeave.total,
            used: data.vacationLeave.used,
            pending: data.vacationLeave.pending,
            left: data.vacationLeave.left,
            ...leaveTypeConfig.vacation
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
        const applications = response.data.data || [];
        
        // Map API response to component format
        const mappedHistory = applications.map((app, index) => ({
          id: app._id,
          type: app.leaveType,
          startDate: new Date(app.startDate).toISOString().split('T')[0],
          endDate: new Date(app.endDate).toISOString().split('T')[0],
          days: app.totalDays,
          reason: app.reason,
          status: app.status, // approved, rejected, pending, cancelled
          appliedOn: new Date(app.createdAt).toISOString().split('T')[0],
          managerComment: app.comments || "",
          rejectReason: app.rejectionReason || "",
          attachment: app.attachment || null,
        }));
        
        setAllLeaveHistory(mappedHistory);
      } catch (error) {
        console.error("Error fetching leave history:", error);
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
          total: data.casualLeave.total,
          used: data.casualLeave.used,
          pending: data.casualLeave.pending,
          left: data.casualLeave.left,
          ...leaveTypeConfig.casual
        },
        {
          type: "sick",
          total: data.sickLeave.total,
          used: data.sickLeave.used,
          pending: data.sickLeave.pending,
          left: data.sickLeave.left,
          ...leaveTypeConfig.sick
        },
        {
          type: "vacation",
          total: data.vacationLeave.total,
          used: data.vacationLeave.used,
          pending: data.vacationLeave.pending,
          left: data.vacationLeave.left,
          ...leaveTypeConfig.vacation
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

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Leave Management</h1>
          <p style={{ color: textSecondary }}>View balances, apply for leave, and track requests</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
        >
          ➕ Apply Leave
        </button>
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
    </div>
  );
}
