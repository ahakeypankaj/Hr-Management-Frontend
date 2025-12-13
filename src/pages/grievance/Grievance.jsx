import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { fetchGrievances, submitGrievance, addGrievanceComment } from "../../services/grievanceService";

const categories = ["HR", "Admin", "Finance", "IT", "Workplace", "Other"];
const priorities = ["high", "medium", "low", "critical"];
const statusOptions = ["Submitted", "In Progress", "Resolved"];

const ITEMS_PER_PAGE = 10;

export default function Grievance() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGrievance, setEditingGrievance] = useState(null);
  const [editForm, setEditForm] = useState({ category: "HR", priority: "medium", anonymous: false });
  const [newComment, setNewComment] = useState("");
  const [commentingGrievanceId, setCommentingGrievanceId] = useState(null);
  const [form, setForm] = useState({ category: "HR", subject: "", description: "", anonymous: false, priority: "medium" });
  
  // Filters
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch grievances on component mount
  useEffect(() => {
    const loadGrievances = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGrievances();
        // Map API response to component format
        const mappedGrievances = data.map(grievance => ({
          id: grievance._id,
          category: grievance.category,
          subject: grievance.subject,
          description: grievance.description,
          status: grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1), // "submitted" -> "Submitted"
          createdAt: new Date(grievance.createdAt).toISOString().split("T")[0], // Format date
          assignedTo: `${grievance.assignedDepartment} Team`,
          priority: grievance.priority,
          isAnonymous: grievance.isAnonymous,
          dueDate: grievance.dueDate,
          escalated: grievance.escalated,
          escalationLevel: grievance.escalationLevel,
          comments: grievance.comments ? grievance.comments.map(comment => ({
            id: comment._id,
            message: comment.message,
            createdAt: comment.createdAt,
            userName: comment.userId?.name || 'Anonymous User'
          })) : []
        }));
        setGrievances(mappedGrievances);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load grievances');
        console.error('Error fetching grievances:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGrievances();
  }, []);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  // Filter grievances
  const filteredGrievances = grievances.filter((g) => {
    if (filterCategory !== "All" && g.category !== filterCategory) return false;
    if (filterStatus !== "All" && g.status !== filterStatus) return false;
    if (filterPriority !== "All" && g.priority !== filterPriority) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGrievances.length / ITEMS_PER_PAGE);
  const paginatedGrievances = filteredGrievances.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = () => setCurrentPage(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const grievanceData = {
        subject: form.subject,
        description: form.description,
        category: form.category,
        priority: form.priority,
        isAnonymous: form.anonymous
      };

      const response = await submitGrievance(grievanceData);

      // Add the new grievance to the list
      const newGrievance = {
        id: response.grievance._id,
        category: response.grievance.category,
        subject: response.grievance.subject,
        description: response.grievance.description,
        status: response.grievance.status.charAt(0).toUpperCase() + response.grievance.status.slice(1),
        createdAt: new Date(response.grievance.createdAt).toISOString().split("T")[0],
        assignedTo: `${response.grievance.assignedDepartment} Team`,
        priority: response.grievance.priority,
        isAnonymous: response.grievance.isAnonymous,
        dueDate: response.grievance.dueDate,
        escalated: response.grievance.escalated,
        escalationLevel: response.grievance.escalationLevel
      };

      setGrievances([newGrievance, ...grievances]);
      setForm({ category: "HR", subject: "", description: "", anonymous: false, priority: "medium" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance');
      console.error('Error submitting grievance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (grievance) => {
    setEditingGrievance(grievance);
    setEditForm({
      category: grievance.category,
      priority: grievance.priority,
      anonymous: grievance.isAnonymous
    });
  };


  const handleAddComment = async (grievanceId) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await addGrievanceComment(grievanceId, newComment);
      
      // Update the grievance with new comments
      const updatedGrievances = grievances.map(g => 
        g.id === grievanceId 
          ? { 
              ...g, 
              comments: response.grievance.comments.map(comment => ({
                id: comment._id,
                message: comment.message,
                createdAt: comment.createdAt,
                userName: comment.userId?.name || 'Anonymous User'
              }))
            }
          : g
      );
      setGrievances(updatedGrievances);
      setNewComment("");
      setCommentingGrievanceId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
      console.error('Error adding comment:', err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Submitted": return { bg: "#dbeafe", color: "#2563eb" };
      case "In Progress": return { bg: "#ffedd5", color: "#ea580c" };
      case "Resolved": return { bg: "#dcfce7", color: "#16a34a" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high": return { bg: "#fee2e2", color: "#dc2626", label: "🔴 High" };
      case "medium": return { bg: "#fef3c7", color: "#d97706", label: "🟡 Medium" };
      case "low": return { bg: "#dcfce7", color: "#16a34a", label: "🟢 Low" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: priority };
    }
  };

  const getCategoryIcon = (category) => {
    const icons = { HR: "👥", Admin: "🏢", Finance: "💰", IT: "💻", Other: "📝" };
    return icons[category] || "📝";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Grievance Management</h1>
          <p style={{ color: textSecondary }}>Submit and track your grievances</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl font-bold text-white transition-all"
          style={{ backgroundColor: showForm ? '#64748b' : navyBlue, boxShadow: showForm ? 'none' : `0 4px 15px ${navyBlue}40` }}
        >
          {showForm ? "✕ Cancel" : "➕ New Grievance"}
        </button>
      </div>

      {/* Submit Form Modal */}
      {showForm && (
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
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Submit New Grievance</h2>
                    <p className="text-orange-200 text-sm">Report an issue or concern</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📁 Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-orange-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🚨 Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-orange-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {priorities.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📌 Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief subject"
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-orange-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>💬 Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your grievance in detail..."
                  rows={5}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-orange-400"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  required
                />
              </div>
              <div 
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: form.anonymous ? 'rgba(234, 88, 12, 0.15)' : (isDark ? '#334155' : '#f8fafc'), border: form.anonymous ? '2px solid #ea580c' : `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
              >
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={form.anonymous}
                  onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                  className="w-5 h-5 rounded accent-orange-500"
                />
                <div>
                  <label htmlFor="anonymous" className="font-semibold cursor-pointer" style={{ color: textPrimary }}>
                    🕶️ Submit Anonymously
                  </label>
                  <p className="text-xs" style={{ color: textSecondary }}>Your identity will be hidden from all parties</p>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: submitting ? '#64748b' : 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    boxShadow: submitting ? 'none' : '0 4px 15px rgba(234, 88, 12, 0.4)'
                  }}
                >
                  {submitting ? '⏳ Submitting...' : '📤 Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGrievance && (
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
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ✏️
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">grievance details</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingGrievance(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form  className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📁 Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>🚨 Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    {priorities.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>📌 Subject</label>
                <input
                  type="text"
                  value={editingGrievance.subject}
                  disabled
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all opacity-60 cursor-not-allowed"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>💬 Description</label>
                <textarea
                  value={editingGrievance.description}
                  disabled
                  rows={5}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all opacity-60 cursor-not-allowed"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                />
              </div>
              <div 
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-90"
                style={{ backgroundColor: editForm.anonymous ? 'rgba(37, 99, 235, 0.15)' : (isDark ? '#334155' : '#f8fafc'), border: editForm.anonymous ? '2px solid #2563eb' : `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
              >
                <input
                  type="checkbox"
                  id="edit-anonymous"
                  checked={editForm.anonymous}
                  className="w-5 h-5 rounded accent-blue-500"
              disabled

                  
                />
                <div>
                  <label htmlFor="edit-anonymous" className="font-semibold cursor-pointer" style={{ color: textPrimary }}>
                    🕶️ Submit Anonymously
                  </label>
                  <p className="text-xs" style={{ color: textSecondary }}>Your identity will be hidden from all parties</p>
                </div>
              </div>
              
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {[
          { label: "Submitted", value: grievances.filter(g => g.status === "Submitted").length, color: "#2563eb", icon: "📩" },
          { label: "In Progress", value: grievances.filter(g => g.status === "In Progress").length, color: "#ea580c", icon: "⏳" },
          { label: "Resolved", value: grievances.filter(g => g.status === "Resolved").length, color: "#16a34a", icon: "✅" },
          { label: "Total", value: grievances.length, color: navyBlue, icon: "📋" },
        ].map((stat, index) => (
          <div key={index} className="p-4 text-center hover-lift" style={cardStyle}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: textSecondary }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 flex flex-col md:flex-row gap-4 animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
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
            <option value="All">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => { setFilterPriority(e.target.value); handleFilterChange(); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="All">All Priorities</option>
            {priorities.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex-1"></div>
        <span className="text-sm" style={{ color: textSecondary }}>
          Showing {paginatedGrievances.length} of {filteredGrievances.length} grievances
        </span>
      </div>

      {/* Grievances List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div className="p-6" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Your Grievances</h2>
        </div>
        <div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p style={{ color: textSecondary }}>Loading grievances...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <span className="text-4xl block mb-2">⚠️</span>
              <p style={{ color: textSecondary }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : paginatedGrievances.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl block mb-2">📭</span>
              <p style={{ color: textSecondary }}>No grievances found</p>
            </div>
          ) : (
            paginatedGrievances.map((grievance) => {
              const statusStyle = getStatusStyle(grievance.status);
              const priorityStyle = getPriorityStyle(grievance.priority);
              return (
                <div 
                  key={grievance.id} 
                  className="p-6 transition-all hover:bg-opacity-50"
                  style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
                >
                  <div className="flex items-start justify-between" onClick={() => handleEditClick(grievance)}>
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
                      >
                        {getCategoryIcon(grievance.category)}
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: textPrimary }}>{grievance.subject}</h3>
                        <p className="text-sm mt-1" style={{ color: textSecondary }}>{grievance.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm" style={{ color: textSecondary }}>
                          <span>📁 {grievance.category}</span>
                          <span>👤 {grievance.assignedTo}</span>
                          <span>📅 {grievance.createdAt}</span>
                          <span 
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}
                          >
                            {priorityStyle.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {grievance.status}
                      </span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {grievance.comments && grievance.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                      <h4 className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>Comments</h4>
                      <div className="space-y-3">
                        {grievance.comments.map((comment) => (
                          <div key={comment.id} className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium" style={{ color: textPrimary }}>{comment.userName}</span>
                              <span className="text-xs" style={{ color: textSecondary }}>
                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: textSecondary }}>{comment.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Comment Section */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentingGrievanceId === grievance.id ? newComment : ""}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={() => setCommentingGrievanceId(grievance.id)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-orange-400"
                        style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                      />
                      <button
                        onClick={() => handleAddComment(grievance.id)}
                        disabled={!newComment.trim() || commentingGrievanceId !== grievance.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                      >
                        💬 Send
                      </button>
                    </div>
                  </div>
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
    </div>
  );
}
