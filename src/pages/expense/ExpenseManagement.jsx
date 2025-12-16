import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { createExpense, getExpenseSummary, listExpensesByUser } from "../../services/expenseService";

// Country codes for phone
const expenseCategories = [
  { id: "travel", name: "Travel", icon: "✈️", color: "#2563eb" },
  { id: "food", name: "Food & Meals", icon: "🍽️", color: "#16a34a" },
  { id: "accommodation", name: "Accommodation", icon: "🏨", color: "#7c3aed" },
  { id: "office", name: "Office Supplies", icon: "📎", color: "#0891b2" },
  { id: "fuel", name: "Fuel", icon: "⛽", color: "#ea580c" },
  { id: "internet", name: "Internet", icon: "📱", color: "#dc2626" },
  { id: "other", name: "Other", icon: "📦", color: "#64748b" },
];

const ITEMS_PER_PAGE = 10;

export default function ExpenseManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [expenses, setExpenses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [expenseSummary, setExpenseSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    paid: 0,
    count: 0
  });

  // Filters
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "travel",
    amount: "",
    date: "",
    description: "",
    receipt: null
  });

  useEffect(() => {
    fetchExpenseSummary();
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [currentPage]);

  const fetchExpenseSummary = async () => {
    try {
      const summary = await getExpenseSummary();
      setExpenseSummary(summary);
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      // Keep default values if API fails
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const response = await listExpensesByUser(currentPage, ITEMS_PER_PAGE);
      
      // Transform API response to match component expectations
      const transformedExpenses = response.expenses.map(expense => ({
        id: expense._id,
        title: expense.description || 'Expense', // Use description as title if no title
        category: expense.expenseType,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
        status: expense.status,
        receipt: expense.receipts && expense.receipts.length > 0,
        description: expense.description,
        receipts: expense.receipts, // Keep original receipts array for detailed view
        rejectionMessage: expense.rejectionMessage
      }));
      
      setExpenses(transformedExpenses);
      setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const inputStyle = {
    backgroundColor: isDark ? '#334155' : '#f8fafc',
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    color: textPrimary
  };

  // Stats
  const totalExpenses = expenseSummary.total;
  const approvedExpenses = expenseSummary.approved;
  const pendingExpenses = expenseSummary.pending;
  const rejectedExpenses = expenseSummary.rejected;

  // Filter logic (client-side filtering on current page data)
  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory !== "All" && expense.category !== filterCategory) return false;
    if (filterStatus !== "All" && expense.status !== filterStatus) return false;
    return true;
  });

  // For display purposes, show filtered count from current page
  const displayExpenses = filteredExpenses;

  const getCategoryInfo = (categoryId) => {
    return expenseCategories.find(c => c.id === categoryId) || expenseCategories[7];
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved": return { bg: "#dcfce7", color: "#16a34a", label: "Approved" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", label: "Pending" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", label: "Rejected" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: status };
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.date) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setCreatingExpense(true);

      const payload = {
        ...expenseForm,
        date: formatDateToDDMMYYYY(expenseForm.date),
      };

      await createExpense(payload);

      setShowCreateModal(false);
      setExpenseForm({
        title: "",
        category: "travel",
        amount: "",
        date: "",
        description: "",
        receipt: null,
      });

      await Promise.all([fetchExpenses(), fetchExpenseSummary()]);

      alert("Expense created successfully!");
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to create expense. Please try again.");
    } finally {
      setCreatingExpense(false);
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Expense Management</h1>
          <p style={{ color: textSecondary }}>Track and manage your expense claims</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
            boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
          }}
        >
          + Create Expense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {[
          { label: "Total Claims", value: formatCurrency(totalExpenses), color: navyBlue, icon: "💰" },
          { label: "Approved", value: formatCurrency(approvedExpenses), color: "#16a34a", icon: "✅" },
          { label: "Pending", value: formatCurrency(pendingExpenses), color: "#d97706", icon: "⏳" },
          { label: "Rejected", value: formatCurrency(rejectedExpenses), color: "#dc2626", icon: "❌" },
        ].map((stat, i) => (
          <div key={i} className="p-5" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: textSecondary }}>{stat.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up overflow-x-auto pb-2">
        {expenseCategories.map((cat) => {
          const count = expenses.filter(e => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => { setFilterCategory(cat.id); setCurrentPage(1); }}
              className="px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: filterCategory === cat.id ? cat.color : (isDark ? '#334155' : '#f1f5f9'),
                color: filterCategory === cat.id ? '#ffffff' : textPrimary,
              }}
            >
              {cat.icon} <span className="hidden sm:inline">{cat.name}</span> ({count})
            </button>
          );
        })}
        <button
          onClick={() => { setFilterCategory("All"); setCurrentPage(1); }}
          className="px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0"
          style={{
            backgroundColor: filterCategory === "All" ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
            color: filterCategory === "All" ? '#ffffff' : textPrimary,
          }}
        >
          All ({expenseSummary.count})
        </button>
      </div>

      {/* Filters & Status */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl animate-fade-in-up" style={cardStyle}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: textSecondary }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-lg outline-none text-sm"
            style={inputStyle}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <span className="text-sm" style={{ color: textSecondary }}>
          Showing {displayExpenses.length} of {expenses.length} expenses (Page {currentPage})
        </span>
      </div>

      {/* Expenses List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div 
          className="p-5"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
          }}
        >
          <h2 className="text-lg font-bold text-white">My Expenses</h2>
        </div>

        {loadingExpenses ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="font-semibold" style={{ color: textPrimary }}>Loading expenses...</p>
          </div>
        ) : displayExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-4">📭</span>
            <p className="font-semibold" style={{ color: textPrimary }}>No expenses found</p>
            <p className="text-sm" style={{ color: textSecondary }}>Create your first expense claim</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {displayExpenses.map((expense) => {
              const category = getCategoryInfo(expense.category);
              const status = getStatusStyle(expense.status);
              return (
                <div 
                  key={expense.id}
                  className="p-5 flex items-center gap-4 hover:bg-opacity-50 transition-all cursor-pointer"
                  style={{ backgroundColor: isDark ? 'transparent' : 'transparent' }}
                  onClick={() => handleViewExpense(expense)}
                >
                  {/* Category Icon */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: textPrimary }}>{expense.title}</p>
                    <p className="text-sm" style={{ color: textSecondary }}>
                      {category.name} • {expense.date}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: textPrimary }}>{formatCurrency(expense.amount)}</p>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Receipt indicator */}
                  <div className="flex-shrink-0">
                    {expense.receipt ? (
                      <span className="text-green-500 text-xl" title="Receipt attached">📎</span>
                    ) : (
                      <span className="text-gray-400 text-xl" title="No receipt">○</span>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Create Expense Modal */}
      {showCreateModal && (
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
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Expense</h2>
                    <p className="text-blue-200 text-sm">Submit a new expense claim</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  📝 Expense Title *
                </label>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={inputStyle}
                  placeholder="e.g., Client Meeting Travel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    📁 Category *
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                    💵 Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={inputStyle}
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  📅 Expense Date *
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-4 py-4 rounded-xl outline-none transition-all"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  📄 Description
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-4 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={inputStyle}
                  placeholder="Provide details about this expense..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  📎 Upload Receipt
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-blue-400"
                  style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setExpenseForm({ ...expenseForm, receipt: e.target.files[0] })}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <span className="text-4xl block mb-2">📤</span>
                    <p className="font-semibold" style={{ color: textPrimary }}>
                      {expenseForm.receipt ? expenseForm.receipt.name : "Click to upload receipt"}
                    </p>
                    <p className="text-sm" style={{ color: textSecondary }}>PNG, JPG or PDF up to 5MB</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExpense}
                  disabled={creatingExpense}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
                    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)'
                  }}
                >
                  {creatingExpense ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
                  ) : (
                    '💰 Submit Expense'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {showViewModal && selectedExpense && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-lg animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ background: `linear-gradient(135deg, ${getCategoryInfo(selectedExpense.category).color} 0%, ${getCategoryInfo(selectedExpense.category).color}cc 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    {getCategoryInfo(selectedExpense.category).icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedExpense.title}</h2>
                    <p className="text-white/80 text-sm">{getCategoryInfo(selectedExpense.category).name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Amount & Status */}
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <div>
                  <p className="text-sm" style={{ color: textSecondary }}>Amount</p>
                  <p className="text-2xl font-bold" style={{ color: textPrimary }}>{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <span 
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{ backgroundColor: getStatusStyle(selectedExpense.status).bg, color: getStatusStyle(selectedExpense.status).color }}
                >
                  {getStatusStyle(selectedExpense.status).label}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Date</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{selectedExpense.date}</span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <span style={{ color: textSecondary }}>Receipt</span>
                  <span className="font-medium" style={{ color: selectedExpense.receipt ? '#16a34a' : '#dc2626' }}>
                    {selectedExpense.receipt ? '✓ Attached' : '✗ Not attached'}
                  </span>
                </div>
                {selectedExpense.description && (
                  <div className="py-2">
                    <p className="text-sm mb-1" style={{ color: textSecondary }}>Description</p>
                    <p className="font-medium" style={{ color: textPrimary }}>{selectedExpense.description}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedExpense.status === 'rejected' && selectedExpense.rejectReason && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#fee2e2' }}>
                  <p className="text-sm font-semibold text-red-600 mb-1">❌ Rejection Reason</p>
                  <p className="text-red-700">{selectedExpense.rejectReason}</p>
                </div>
              )}

              <button
                onClick={() => setShowViewModal(false)}
                className="w-full py-4 rounded-xl font-semibold transition-all hover:opacity-80"
                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
