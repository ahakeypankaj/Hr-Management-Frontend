import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { addGrievanceComment } from "../../services/grievanceService";

const statusOptions = [
  { value: "submitted", label: "Submitted", color: "#f59e0b", bgColor: "#fef3c7" },
  { value: "in-review", label: "In Review", color: "#3b82f6", bgColor: "#dbeafe" },
  { value: "resolved", label: "Resolved", color: "#10b981", bgColor: "#d1fae5" },
  { value: "reopen", label: "Reopen", color: "#ef4444", bgColor: "#fee2e2" }
];

export default function HRGrievances() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newComment, setNewComment] = useState("");
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    fetchAllGrievances();
  }, []);

  const fetchAllGrievances = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/grievance/all');
      // Map API response to component format
      const mappedGrievances = response.data.map(grievance => ({
        ...grievance,
        comments: grievance.comments || []
      }));
      setGrievances(mappedGrievances);
    } catch (error) {
      console.error('Error fetching grievances:', error);
      setError('Failed to load grievances');
    } finally {
      setLoading(false);
    }
  };

  const updateGrievanceStatus = async (grievanceId, newStatus) => {
    try {
      setUpdating(grievanceId);
      const response = await api.put(`/employee/grievance/${grievanceId}/status`, {
        status: newStatus
      });

      // Update local state
      setGrievances(prev => prev.map(g =>
        g._id === grievanceId ? { ...g, status: newStatus } : g
      ));

      setSuccess('Grievance status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating grievance status:', error);
      setError('Failed to update grievance status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddComment = async (grievanceId) => {
    const commentText = commentInputs[grievanceId] || "";
    if (!commentText.trim()) return;

    try {
      setCommentingOn(grievanceId);
      const response = await addGrievanceComment(grievanceId, commentText);

      // Update the grievance with new comments
      const updatedGrievances = grievances.map(g =>
        g._id === grievanceId
          ? {
              ...g,
              comments: response.comments || [...(g.comments || []), {
                id: Date.now(),
                message: commentText,
                createdAt: new Date().toISOString(),
                userName: user.name || 'HR Manager',
                userRole: user.role === 'hr_manager' ? 'HR Manager' : 'Admin',
                isAnonymous: false // HR/Admin comments are never anonymous
              }]
            }
          : g
      );
      setGrievances(updatedGrievances);
      setCommentInputs(prev => ({ ...prev, [grievanceId]: "" }));
      setCommentingOn(null);
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
      setTimeout(() => setError(''), 3000);
      setCommentingOn(null);
    }
  };



  const filteredGrievances = grievances.filter(grievance => {
    const matchesSearch = grievance.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grievance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (grievance.employeeName && grievance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || grievance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>Grievance Management</h1>
          <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Manage and track all employee grievances</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={fetchAllGrievances}
            className="px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1 sm:gap-2 transition-all hover:opacity-80"
            style={{ backgroundColor: navyBlue, color: '#ffffff' }}
          >
            🔄 <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ backgroundColor: '#d1fae5', border: '1px solid #10b981' }}>
          <span className="text-xl">✅</span>
          <span className="font-medium" style={{ color: '#065f46' }}>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444' }}>
          <span className="text-xl">❌</span>
          <span className="font-medium" style={{ color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search grievances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        {statusOptions.map(status => {
          const count = grievances.filter(g => g.status === status.value).length;
          return (
            <div key={status.value} className="p-4 rounded-xl" style={{ backgroundColor: status.bgColor, border: `1px solid ${status.color}30` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: status.color }}>{status.label}</p>
                  <p className="text-2xl font-bold" style={{ color: status.color }}>{count}</p>
                </div>
                <span className="text-2xl">📋</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grievances List */}
      <div className="space-y-4 animate-fade-in-up stagger-2">
        {filteredGrievances.length === 0 ? (
          <div className="text-center py-12" style={cardStyle}>
            <span className="text-4xl mb-4 block">📝</span>
            <p className="text-lg font-medium" style={{ color: textPrimary }}>No grievances found</p>
            <p style={{ color: textSecondary }}>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredGrievances.map((grievance, index) => {
            const statusInfo = getStatusInfo(grievance.status);
            return (
              <div key={grievance._id} className="p-6" style={{ ...cardStyle, animationDelay: `${index * 100}ms` }}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                           style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>
                        {grievance.employeeName ? grievance.employeeName.charAt(0) : '👤'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate" style={{ color: textPrimary }}>{grievance.subject}</h3>
                        <p className="text-sm mb-2" style={{ color: textSecondary }}>
                          {grievance.employeeName || 'Anonymous'} • {new Date(grievance.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm line-clamp-2" style={{ color: textSecondary }}>{grievance.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
                            📁 {grievance.category}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
                            🚨 {grievance.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={grievance.status}
                        onChange={(e) => updateGrievanceStatus(grievance._id, e.target.value)}
                        disabled={updating === grievance._id}
                        className="px-4 py-2 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        style={{
                          backgroundColor: statusInfo.bgColor,
                          border: `1px solid ${statusInfo.color}30`,
                          color: statusInfo.color,
                          fontWeight: '600'
                        }}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {updating === grievance._id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments Section - Always Visible */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  {/* Existing Comments */}
                  {grievance.comments && grievance.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-semibold text-sm" style={{ color: textPrimary }}>💬 Comments ({grievance.comments.length})</h4>
                      {grievance.comments.map((comment, commentIndex) => (
                        <div key={comment.id || commentIndex} className="p-3 rounded-lg"
                             style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                 style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}>
                              {comment.isAnonymous ? '👤' : (comment.userName ? comment.userName.charAt(0) : '👤')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm" style={{ color: textPrimary }}>
                                  {comment.isAnonymous ? 'Anonymous' : (comment.userName || 'Anonymous')}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
                                  {comment.userRole || 'Employee'}
                                </span>
                                <span className="text-xs" style={{ color: textSecondary }}>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm" style={{ color: textSecondary }}>{comment.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={commentInputs[grievance._id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [grievance._id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(grievance._id)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      disabled={commentingOn === grievance._id}
                    />
                    <button
                      onClick={() => handleAddComment(grievance._id)}
                      disabled={!(commentInputs[grievance._id] || '').trim() || commentingOn === grievance._id}
                      className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: navyBlue, color: '#ffffff' }}
                    >
                      {commentingOn === grievance._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '💬 Send'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}