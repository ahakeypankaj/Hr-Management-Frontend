import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

// Mock audit logs
const mockAuditLogs = [
  { id: 1, action: "Leave Approved", user: "Ravi Sharma", target: "Asha Kumar", details: "Casual Leave (3 days)", timestamp: "2024-12-12 10:30 AM", type: "approval" },
  { id: 2, action: "User Created", user: "HR Admin", target: "Rahul Singh", details: "New employee onboarded", timestamp: "2024-12-11 3:15 PM", type: "user" },
  { id: 3, action: "Password Reset", user: "System", target: "Priya Verma", details: "Password reset requested", timestamp: "2024-12-11 11:00 AM", type: "security" },
  { id: 4, action: "Leave Rejected", user: "Ravi Sharma", target: "Vikram Singh", details: "Earned Leave - Project deadline", timestamp: "2024-12-10 4:45 PM", type: "approval" },
  { id: 5, action: "Role Changed", user: "HR Admin", target: "Meena Sharma", details: "Promoted to Senior Analyst", timestamp: "2024-12-10 2:00 PM", type: "user" },
  { id: 6, action: "Expense Approved", user: "Finance Team", target: "Anita Verma", details: "Travel expense ₹15,000", timestamp: "2024-12-09 5:30 PM", type: "approval" },
];

// Mock leave policies
const mockLeavePolicies = [
  { id: 1, type: "Casual Leave", total: 12, carryOver: 3, maxConsecutive: 5, notice: 1 },
  { id: 2, type: "Sick Leave", total: 8, carryOver: 0, maxConsecutive: 3, notice: 0 },
  { id: 3, type: "Earned Leave", total: 15, carryOver: 10, maxConsecutive: 10, notice: 7 },
  { id: 4, type: "Optional Leave", total: 4, carryOver: 0, maxConsecutive: 2, notice: 1 },
];

// Mock departments
const mockDepartments = [
  { id: 1, name: "Engineering", head: "Ravi Sharma", employees: 45, location: "Bangalore" },
  { id: 2, name: "Sales", head: "Priya Verma", employees: 25, location: "Mumbai" },
  { id: 3, name: "Human Resources", head: "HR Admin", employees: 12, location: "Bangalore" },
  { id: 4, name: "Finance", head: "Suresh Reddy", employees: 18, location: "Bangalore" },
  { id: 5, name: "Marketing", head: "Anita Patel", employees: 15, location: "Delhi" },
];

// Mock weekly quotes
const mockWeeklyQuotes = [
  { id: 1, quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", weekStart: "2024-12-09", status: "active" },
  { id: 2, quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", weekStart: "2024-12-16", status: "scheduled" },
  { id: 3, quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", weekStart: "2024-12-23", status: "scheduled" },
  { id: 4, quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", weekStart: "2024-12-02", status: "past" },
  { id: 5, quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", weekStart: "2024-11-25", status: "past" },
];

export default function Settings() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState("audit");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [quotes, setQuotes] = useState(mockWeeklyQuotes);
  const [newQuote, setNewQuote] = useState({ quote: "", author: "", weekStart: "" });

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const tabs = [
    { id: "audit", label: "Audit Logs", icon: "📋" },
    { id: "policies", label: "Leave Policies", icon: "📝" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "quotes", label: "Weekly Quotes", icon: "💬" },
    { id: "announcements", label: "Announcements", icon: "📢" },
  ];

  const getActionTypeStyle = (type) => {
    switch (type) {
      case "approval": return { bg: "#dcfce7", color: "#16a34a", icon: "✅" };
      case "user": return { bg: "#dbeafe", color: "#2563eb", icon: "👤" };
      case "security": return { bg: "#fef3c7", color: "#d97706", icon: "🔐" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "📋" };
    }
  };

  const getQuoteStatusStyle = (status) => {
    switch (status) {
      case "active": return { bg: "#dcfce7", color: "#16a34a", label: "🟢 Active" };
      case "scheduled": return { bg: "#dbeafe", color: "#2563eb", label: "📅 Scheduled" };
      case "past": return { bg: "#f1f5f9", color: "#64748b", label: "✓ Completed" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (type === 'quote' && item) {
      setNewQuote({ quote: item.quote, author: item.author, weekStart: item.weekStart });
    } else {
      setNewQuote({ quote: "", author: "", weekStart: "" });
    }
    setShowModal(true);
  };

  const handleSaveQuote = () => {
    if (editItem) {
      setQuotes(quotes.map(q => q.id === editItem.id ? { ...q, ...newQuote } : q));
    } else {
      const newId = Math.max(...quotes.map(q => q.id)) + 1;
      setQuotes([...quotes, { id: newId, ...newQuote, status: "scheduled" }]);
    }
    setShowModal(false);
    setNewQuote({ quote: "", author: "", weekStart: "" });
  };

  const handleDeleteQuote = (id) => {
    if (confirm("Are you sure you want to delete this quote?")) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Settings & Audit</h1>
          <p style={{ color: textSecondary }}>Manage policies, departments, quotes, and view system activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl animate-fade-in-up overflow-x-auto" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? navyBlue : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : textSecondary,
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Recent Activity</h2>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              📥 Export Logs
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {mockAuditLogs.map((log) => {
              const typeStyle = getActionTypeStyle(log.type);
              return (
                <div key={log.id} className="p-5 hover:bg-opacity-50 transition-all">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: typeStyle.bg }}
                    >
                      {typeStyle.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold" style={{ color: textPrimary }}>{log.action}</h3>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                        >
                          {log.type}
                        </span>
                      </div>
                      <p style={{ color: textSecondary }}>
                        <span className="font-medium">{log.user}</span> → {log.target}
                      </p>
                      <p className="text-sm mt-1" style={{ color: textSecondary }}>{log.details}</p>
                    </div>
                    <p className="text-sm" style={{ color: textSecondary }}>{log.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leave Policies Tab */}
      {activeTab === "policies" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Leave Policies</h2>
            <button
              onClick={() => openModal('policy')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: navyBlue }}
            >
              + Add Policy
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <tr>
                  {["Leave Type", "Total Days", "Carry Over", "Max Consecutive", "Notice (Days)", "Actions"].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase" style={{ color: textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockLeavePolicies.map((policy) => (
                  <tr key={policy.id} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <td className="px-6 py-4 font-medium" style={{ color: textPrimary }}>{policy.type}</td>
                    <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.total}</td>
                    <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.carryOver}</td>
                    <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.maxConsecutive}</td>
                    <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.notice}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal('policy', policy)}
                        className="px-3 py-1 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Departments</h2>
            <button
              onClick={() => openModal('department')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: navyBlue }}
            >
              + Add Department
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {mockDepartments.map((dept) => (
              <div 
                key={dept.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.02]"
                style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{dept.name}</h3>
                  <button
                    onClick={() => openModal('department', dept)}
                    className="text-sm"
                    style={{ color: navyBlue }}
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p style={{ color: textSecondary }}>👤 Head: <span style={{ color: textPrimary }}>{dept.head}</span></p>
                  <p style={{ color: textSecondary }}>👥 Employees: <span style={{ color: textPrimary }}>{dept.employees}</span></p>
                  <p style={{ color: textSecondary }}>📍 Location: <span style={{ color: textPrimary }}>{dept.location}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Quotes Tab */}
      {activeTab === "quotes" && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Add New Quote */}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>💬 Add Weekly Quote</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Quote</label>
                <textarea
                  rows={3}
                  value={newQuote.quote}
                  onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Enter an inspiring quote..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Author</label>
                  <input
                    type="text"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Week Start Date (Monday)</label>
                  <input
                    type="date"
                    value={newQuote.weekStart}
                    onChange={(e) => setNewQuote({ ...newQuote, weekStart: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveQuote}
                disabled={!newQuote.quote || !newQuote.author || !newQuote.weekStart}
                className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: navyBlue }}
              >
                ➕ Schedule Quote
              </button>
            </div>
          </div>

          {/* Quotes List */}
          <div className="p-6" style={cardStyle}>
            <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Scheduled & Past Quotes</h3>
            <div className="space-y-4">
              {quotes.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart)).map((quote) => {
                const statusStyle = getQuoteStatusStyle(quote.status);
                return (
                  <div 
                    key={quote.id}
                    className="p-5 rounded-xl transition-all"
                    style={{ 
                      backgroundColor: isDark ? '#334155' : '#f8fafc', 
                      border: quote.status === 'active' ? `2px solid ${navyBlue}` : `1px solid ${isDark ? '#475569' : '#e2e8f0'}` 
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('quote', quote)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <blockquote className="text-lg italic mb-2" style={{ color: textPrimary }}>
                      "{quote.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <p className="font-medium" style={{ color: navyBlue }}>— {quote.author}</p>
                      <p className="text-sm" style={{ color: textSecondary }}>
                        📅 Week of {new Date(quote.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Create Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Write your announcement..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Target Audience</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    <option>All Employees</option>
                    <option>Engineering</option>
                    <option>Sales</option>
                    <option>HR</option>
                    <option>Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Priority</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  >
                    <option>Normal</option>
                    <option>Important</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <button
                className="w-full py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: navyBlue }}
              >
                📢 Publish Announcement
              </button>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="p-6" style={cardStyle}>
            <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Recent Announcements</h3>
            <div className="space-y-3">
              {[
                { title: "Holiday Notice: Christmas", date: "Dec 10, 2024", audience: "All", priority: "normal" },
                { title: "Office Closed: Dec 25-26", date: "Dec 8, 2024", audience: "All", priority: "important" },
                { title: "Year-end Review Schedule", date: "Dec 5, 2024", audience: "All", priority: "urgent" },
              ].map((ann, i) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}
                >
                  <div>
                    <h4 className="font-medium" style={{ color: textPrimary }}>{ann.title}</h4>
                    <p className="text-sm" style={{ color: textSecondary }}>{ann.date} • {ann.audience}</p>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: ann.priority === "urgent" ? "#fee2e2" : ann.priority === "important" ? "#fef3c7" : "#dcfce7",
                      color: ann.priority === "urgent" ? "#dc2626" : ann.priority === "important" ? "#d97706" : "#16a34a"
                    }}
                  >
                    {ann.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md p-6 animate-scale-in" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
                {editItem ? 'Edit' : 'Add'} {modalType === 'policy' ? 'Leave Policy' : modalType === 'quote' ? 'Quote' : 'Department'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
              >
                ✕
              </button>
            </div>

            {modalType === 'policy' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Leave Type</label>
                  <input
                    type="text"
                    defaultValue={editItem?.type || ''}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Total Days</label>
                    <input type="number" defaultValue={editItem?.total || ''} className="w-full px-4 py-3 rounded-xl outline-none" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Carry Over</label>
                    <input type="number" defaultValue={editItem?.carryOver || ''} className="w-full px-4 py-3 rounded-xl outline-none" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} />
                  </div>
                </div>
              </div>
            )}

            {modalType === 'department' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Department Name</label>
                  <input type="text" defaultValue={editItem?.name || ''} className="w-full px-4 py-3 rounded-xl outline-none" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Department Head</label>
                  <input type="text" defaultValue={editItem?.head || ''} className="w-full px-4 py-3 rounded-xl outline-none" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Location</label>
                  <input type="text" defaultValue={editItem?.location || ''} className="w-full px-4 py-3 rounded-xl outline-none" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }} />
                </div>
              </div>
            )}

            {modalType === 'quote' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Quote</label>
                  <textarea
                    rows={3}
                    value={newQuote.quote}
                    onChange={(e) => setNewQuote({ ...newQuote, quote: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Author</label>
                  <input
                    type="text"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Week Start Date</label>
                  <input
                    type="date"
                    value={newQuote.weekStart}
                    onChange={(e) => setNewQuote({ ...newQuote, weekStart: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}>Cancel</button>
              <button 
                onClick={modalType === 'quote' ? handleSaveQuote : () => setShowModal(false)} 
                className="flex-1 py-3 rounded-xl font-bold text-white" 
                style={{ backgroundColor: navyBlue }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
