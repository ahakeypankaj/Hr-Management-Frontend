import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

// Mock approval data
const mockApprovals = {
  onboarding: [
    { id: 1, name: "Rahul Singh", email: "rahul.singh@company.com", department: "Engineering", designation: "Software Engineer", submittedOn: "2024-12-10", documents: 5, status: "pending" },
    { id: 2, name: "Priya Patel", email: "priya.patel@company.com", department: "Sales", designation: "Sales Executive", submittedOn: "2024-12-09", documents: 4, status: "pending" },
    { id: 3, name: "Amit Kumar", email: "amit.kumar@company.com", department: "Finance", designation: "Analyst", submittedOn: "2024-12-08", documents: 5, status: "pending" },
    { id: 4, name: "Neha Sharma", email: "neha.sharma@company.com", department: "HR", designation: "HR Executive", submittedOn: "2024-12-07", documents: 5, status: "pending" },
    { id: 5, name: "Kiran Reddy", email: "kiran.reddy@company.com", department: "Engineering", designation: "QA Engineer", submittedOn: "2024-12-06", documents: 4, status: "pending" },
  ],
  leave: [
    { id: 1, name: "Asha Kumar", type: "Casual", startDate: "2024-12-20", endDate: "2024-12-22", days: 3, reason: "Family function", status: "pending", department: "Engineering" },
    { id: 2, name: "Vikram Singh", type: "Casual", startDate: "2024-12-16", endDate: "2024-12-17", days: 2, reason: "Internet installation", status: "pending", department: "DevOps" },
    { id: 3, name: "Meena Sharma", type: "Sick", startDate: "2024-12-15", endDate: "2024-12-15", days: 1, reason: "Medical appointment", status: "pending", department: "Sales" },
    { id: 4, name: "Suresh Reddy", type: "Vacation", startDate: "2025-01-02", endDate: "2025-01-10", days: 7, reason: "Vacation", status: "pending", department: "Finance" },
    { id: 5, name: "Deepa Nair", type: "Casual", startDate: "2024-12-18", endDate: "2024-12-18", days: 1, reason: "Personal work", status: "pending", department: "HR" },
    { id: 6, name: "Rajesh Kumar", type: "Sick", startDate: "2024-12-19", endDate: "2024-12-20", days: 2, reason: "Flu", status: "pending", department: "Engineering" },
  ],
  expense: [
    { id: 1, name: "Anita Verma", category: "Travel", amount: 15000, description: "Client visit to Mumbai", submittedOn: "2024-12-08", receipts: 3, status: "pending", department: "Sales" },
    { id: 2, name: "Rahul Singh", category: "Equipment", amount: 5500, description: "Keyboard and mouse", submittedOn: "2024-12-07", receipts: 1, status: "pending", department: "Engineering" },
    { id: 3, name: "Priya Patel", category: "Software", amount: 12000, description: "Design tool subscription", submittedOn: "2024-12-06", receipts: 1, status: "pending", department: "Engineering" },
  ],
};

const leaveTypes = ["All", "Casual", "Sick", "Vacation"];
const expenseCategories = ["All", "Travel", "Equipment", "Software", "Other"];
const departments = ["All", "Engineering", "Sales", "Finance", "HR", "DevOps"];
const ITEMS_PER_PAGE = 10;

export default function Approvals() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState("onboarding");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [comment, setComment] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  // Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterExpenseCategory, setFilterExpenseCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  const tabs = [
    { id: "onboarding", label: "Onboarding", count: mockApprovals.onboarding.length, icon: "📋" },
    { id: "leave", label: "Leave Requests", count: mockApprovals.leave.length, icon: "🏖️" },
    { id: "expense", label: "Expenses", count: mockApprovals.expense.length, icon: "💰" },
  ];

  // Get and filter current data
  const rawData = mockApprovals[activeTab] || [];
  const filteredData = rawData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || item.department === filterDept;
    
    if (activeTab === "leave") {
      const matchesType = filterLeaveType === "All" || item.type === filterLeaveType;
      return matchesSearch && matchesDept && matchesType;
    }
    if (activeTab === "expense") {
      const matchesCategory = filterExpenseCategory === "All" || item.category === filterExpenseCategory;
      return matchesSearch && matchesCategory;
    }
    return matchesSearch && matchesDept;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const totalPending = Object.values(mockApprovals).flat().length;

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(item => item.id));
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const openActionModal = (action, item = null) => {
    setModalAction(action);
    setModalItem(item);
    setShowModal(true);
    setComment("");
    setEffectiveDate("");
  };

  const handleAction = () => {
    // API call would go here
    setShowModal(false);
    setSelectedItems([]);
  };

  const handleBulkAction = (action) => {
    openActionModal(action);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedItems([]);
    setCurrentPage(1);
    setSearchQuery("");
    setFilterDept("All");
    setFilterLeaveType("All");
    setFilterExpenseCategory("All");
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Approvals Dashboard</h1>
          <p style={{ color: textSecondary }}>Manage onboarding, leave, and expense requests</p>
        </div>
        <div 
          className="px-4 py-2 rounded-xl"
          style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
        >
          <span className="font-bold text-2xl">{totalPending}</span>
          <span className="ml-2 text-sm">pending approvals</span>
        </div>
      </div>

      {/* Stats / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
        {tabs.map((tab, i) => (
          <div 
            key={tab.id}
            className="p-5 cursor-pointer hover:scale-[1.02] transition-all"
            style={{ 
              ...cardStyle, 
              borderColor: activeTab === tab.id ? navyBlue : (isDark ? '#334155' : '#e2e8f0'),
              borderWidth: activeTab === tab.id ? '2px' : '1px'
            }}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm">{tab.label}</p>
                <p className="text-3xl font-bold" style={{ color: activeTab === tab.id ? navyBlue : textPrimary }}>{tab.count}</p>
              </div>
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: activeTab === tab.id ? `${navyBlue}15` : (isDark ? '#334155' : '#f1f5f9') }}
              >
                {tab.icon}
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
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            />
          </div>
          
          {/* Department Filter (for onboarding and leave) */}
          {(activeTab === "onboarding" || activeTab === "leave") && (
            <select
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
              ))}
            </select>
          )}

          {/* Leave Type Filter */}
          {activeTab === "leave" && (
            <select
              value={filterLeaveType}
              onChange={(e) => { setFilterLeaveType(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              {leaveTypes.map((t) => (
                <option key={t} value={t}>{t === "All" ? "All Leave Types" : t}</option>
              ))}
            </select>
          )}

          {/* Expense Category Filter */}
          {activeTab === "expense" && (
            <select
              value={filterExpenseCategory}
              onChange={(e) => { setFilterExpenseCategory(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
              ))}
            </select>
          )}
        </div>
        <div className="mt-3 text-sm" style={{ color: textSecondary }}>
          Showing {paginatedData.length} of {filteredData.length} requests
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div 
          className="p-4 rounded-xl flex items-center justify-between animate-fade-in-up"
          style={{ backgroundColor: `${navyBlue}10`, border: `1px solid ${navyBlue}` }}
        >
          <p style={{ color: navyBlue }} className="font-medium">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#16a34a' }}
            >
              ✓ Approve All
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#dc2626' }}
            >
              ✗ Reject All
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-4 py-2 rounded-xl font-semibold transition-all"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
        {/* Table Header */}
        <div 
          className="p-4 flex items-center gap-4"
          style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, backgroundColor: isDark ? '#334155' : '#f8fafc' }}
        >
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded"
            />
            <span className="ml-2 text-sm font-medium" style={{ color: textSecondary }}>Select All</span>
          </label>
        </div>

        {/* Items */}
        <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          {paginatedData.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4">✅</span>
              <p className="font-bold text-lg" style={{ color: textPrimary }}>All caught up!</p>
              <p style={{ color: textSecondary }}>No pending {activeTab} requests</p>
            </div>
          ) : (
            paginatedData.map((item, i) => (
              <div 
                key={item.id}
                className="p-5 hover:bg-opacity-50 transition-all"
                style={{ backgroundColor: selectedItems.includes(item.id) ? `${navyBlue}05` : 'transparent' }}
              >
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-5 h-5 rounded mt-1"
                  />
                  
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${navyBlue}, #2563eb)` }}
                  >
                    {item.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold" style={{ color: textPrimary }}>{item.name}</h3>
                      {(activeTab === "onboarding" || activeTab === "leave") && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}>
                          {item.department}
                        </span>
                      )}
                    </div>
                    
                    {/* Tab-specific content */}
                    {activeTab === "onboarding" && (
                      <div className="text-sm" style={{ color: textSecondary }}>
                        <p>{item.email} • {item.designation}</p>
                        <p className="mt-1">📄 {item.documents} documents uploaded • Submitted {item.submittedOn}</p>
                      </div>
                    )}
                    
                    {activeTab === "leave" && (
                      <div className="text-sm" style={{ color: textSecondary }}>
                        <p className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>{item.type}</span>
                          <span>{item.startDate} → {item.endDate}</span>
                          <span className="font-medium">({item.days} day{item.days > 1 ? 's' : ''})</span>
                        </p>
                        <p className="mt-1">📝 {item.reason}</p>
                      </div>
                    )}
                    
                    {activeTab === "expense" && (
                      <div className="text-sm" style={{ color: textSecondary }}>
                        <p className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>{item.category}</span>
                          <span className="font-bold text-lg" style={{ color: '#16a34a' }}>₹{item.amount.toLocaleString()}</span>
                        </p>
                        <p className="mt-1">📝 {item.description} • 🧾 {item.receipts} receipt{item.receipts > 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openActionModal('approve', item)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => openActionModal('reject', item)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      ✗ Reject
                    </button>
                    {activeTab === "onboarding" && (
                      <button
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                      >
                        📄 View Docs
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
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

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md p-6 animate-scale-in" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
                {modalAction === 'approve' ? '✓ Approve' : '✗ Reject'} {modalItem ? 'Request' : `${selectedItems.length} Requests`}
              </h2>
            </div>

            {modalItem && (
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <p className="font-bold" style={{ color: textPrimary }}>{modalItem.name}</p>
                <p className="text-sm" style={{ color: textSecondary }}>
                  {activeTab === "onboarding" && `${modalItem.department} - ${modalItem.designation}`}
                  {activeTab === "leave" && `${modalItem.type} (${modalItem.days} days)`}
                  {activeTab === "expense" && `${modalItem.category} - ₹${modalItem.amount.toLocaleString()}`}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {activeTab === "onboarding" && modalAction === "approve" && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Comment {modalAction === 'reject' && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder={modalAction === 'approve' ? 'Add a note (optional)...' : 'Please provide a reason for rejection...'}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ backgroundColor: modalAction === 'approve' ? '#16a34a' : '#dc2626' }}
                >
                  {modalAction === 'approve' ? '✓ Confirm Approval' : '✗ Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
