import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Mock leave balances (changed Work From Home to Optional Leave)
const leaveBalances = [
  { type: "Casual Leave", total: 12, used: 4, pending: 1, color: "#2563eb", icon: "🏖️" },
  { type: "Sick Leave", total: 8, used: 2, pending: 0, color: "#dc2626", icon: "🏥" },
  { type: "Earned Leave", total: 15, used: 5, pending: 0, color: "#16a34a", icon: "💼" },
  { type: "Optional Leave", total: 4, used: 1, pending: 0, color: "#7c3aed", icon: "📅" },
];

// Mock leave history with reject reasons
const allLeaveHistory = [
  { id: 1, type: "Casual Leave", startDate: "2024-12-20", endDate: "2024-12-22", days: 3, reason: "Family function", status: "pending", appliedOn: "2024-12-10", managerComment: "", rejectReason: "" },
  { id: 2, type: "Optional Leave", startDate: "2024-12-16", endDate: "2024-12-16", days: 1, reason: "Personal work", status: "approved", appliedOn: "2024-12-08", managerComment: "Approved.", rejectReason: "" },
  { id: 3, type: "Sick Leave", startDate: "2024-11-25", endDate: "2024-11-26", days: 2, reason: "Fever and cold", status: "approved", appliedOn: "2024-11-24", managerComment: "Take care and rest well.", rejectReason: "" },
  { id: 4, type: "Casual Leave", startDate: "2024-11-15", endDate: "2024-11-15", days: 1, reason: "Personal work", status: "rejected", appliedOn: "2024-11-10", managerComment: "", rejectReason: "Critical project deadline on Nov 16. Your presence is required for the client demo. Please reschedule to next week." },
  { id: 5, type: "Earned Leave", startDate: "2024-10-10", endDate: "2024-10-15", days: 5, reason: "Annual vacation", status: "approved", appliedOn: "2024-09-20", managerComment: "Enjoy your vacation!", rejectReason: "" },
  { id: 6, type: "Optional Leave", startDate: "2024-09-15", endDate: "2024-09-15", days: 1, reason: "Festival", status: "approved", appliedOn: "2024-09-10", managerComment: "Approved.", rejectReason: "" },
  { id: 7, type: "Sick Leave", startDate: "2024-08-20", endDate: "2024-08-20", days: 1, reason: "Doctor appointment", status: "approved", appliedOn: "2024-08-18", managerComment: "", rejectReason: "" },
  { id: 8, type: "Casual Leave", startDate: "2024-07-05", endDate: "2024-07-07", days: 3, reason: "Family event", status: "rejected", appliedOn: "2024-06-25", managerComment: "", rejectReason: "Insufficient leave balance at the time of request. You had only 2 casual leaves remaining." },
];

const ITEMS_PER_PAGE = 5;

export default function LeaveManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: null,
  });

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

  // Filter leave history
  const filteredHistory = allLeaveHistory.filter(leave => {
    if (filterType !== "all" && leave.type !== filterType) return false;
    if (filterStatus !== "all" && leave.status !== filterStatus) return false;
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
      case "approved": return { bg: "#dcfce7", color: "#16a34a", label: "✓ Approved" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", label: "⏳ Pending" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", label: "✗ Rejected" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  const handleApply = () => {
    setShowApplyModal(false);
    setLeaveForm({ type: "", startDate: "", endDate: "", reason: "", attachment: null });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        {leaveBalances.map((leave, i) => {
          const available = leave.total - leave.used - leave.pending;
          const percentage = ((leave.used + leave.pending) / leave.total) * 100;
          return (
            <div key={i} className="p-5 hover:scale-[1.02] transition-all" style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{leave.icon}</span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${leave.color}20`, color: leave.color }}
                >
                  {available} left
                </span>
              </div>
              <h3 className="font-bold" style={{ color: textPrimary }}>{leave.type}</h3>
              
              {/* Progress Bar */}
              <div className="mt-3 mb-2">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%`, backgroundColor: leave.color }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs" style={{ color: textSecondary }}>
                <span>Used: {leave.used}</span>
                <span>Pending: {leave.pending}</span>
                <span>Total: {leave.total}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Filter by Type:</span>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="all">All Types</option>
            {leaveBalances.map((l, i) => (
              <option key={i} value={l.type}>{l.type}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
          {paginatedHistory.length === 0 ? (
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
                        style={{ backgroundColor: `${leaveBalances.find(l => l.type === leave.type)?.color || navyBlue}20` }}
                      >
                        {leaveBalances.find(l => l.type === leave.type)?.icon || "📅"}
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: textPrimary }}>{leave.type}</h3>
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
                      {leave.status === "pending" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancel(leave.id); }}
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
{leave.status === "rejected" && leave.rejectReason && (
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
                      {leave.managerComment && leave.status !== "rejected" && (
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

      {/* Apply Leave Modal */}
      {showApplyModal && (
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
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ 
                background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
              }}
            >
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
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📋 Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select leave type</option>
                  {leaveBalances.map((l, i) => (
                    <option key={i} value={l.type}>{l.icon} {l.type} ({l.total - l.used - l.pending} available)</option>
                  ))}
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
                  <input type="file" className="hidden" onChange={(e) => setLeaveForm({ ...leaveForm, attachment: e.target.files[0] })} />
                </label>
                {leaveForm.attachment && (
                  <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: `${navyBlue}15` }}>
                    <span>📄</span>
                    <span className="font-medium" style={{ color: navyBlue }}>{leaveForm.attachment.name}</span>
                  </div>
                )}
              </div>

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
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ 
                    background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
                  }}
                >
                  🚀 Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
