import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getPendingExpenses, approveExpense, rejectExpense } from "../../services/expenseService";
import { getPendingLeaveApprovals, approveLeave, rejectLeave, getTeamLeaveCalendar } from "../../services/leaveService";
import { fetchEmployees } from "../../services/directoryService";
import * as onboardingServices from "../../services/onboardingServices";
import { useScrollLock } from "../../hooks/useScrollLock";

// Leave type configuration for calendar
const leaveTypeConfig = {
  casual: { color: "#60a5fa", icon: "🏖️", label: "Casual" },
  vacation: { color: "#a78bfa", icon: "✈️", label: "Vacation" },
  sick: { color: "#f87171", icon: "🏥", label: "Sick" },
};

// Mock approval data - onboarding will be fetched from API
const mockApprovals = {
  onboarding: [], // Will be populated from API
};

const leaveTypes = ["All", "Casual", "Sick", "Vacation", "Annual", "Unpaid", "Maternity", "Paternity", "Bereavement"];
const expenseCategories = ["All", "travel", "food", "accommodation", "office", "fuel", "internet", "other"];
const departments = ["All", "Engineering", "Sales", "Finance", "HR", "DevOps"];
const ITEMS_PER_PAGE = 10;

export default function Approvals() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("leave");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTeamCalendarModal, setShowTeamCalendarModal] = useState(false);
  const [modalAction, setModalAction] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [comment, setComment] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  // Calendar state for team leave calendar
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [calendarData, setCalendarData] = useState(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState(null);
  useScrollLock(showModal);

  // Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterExpenseCategory, setFilterExpenseCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [leavePagination, setLeavePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  });

  // Expense data state
  const [expenseData, setExpenseData] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseTotal, setExpenseTotal] = useState(0);

  // Leave data state
  const [leaveData, setLeaveData] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveTotal, setLeaveTotal] = useState(0);

  // Directory users for matching
  const [allUsers, setAllUsers] = useState([]);

  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState([]);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingTotal, setOnboardingTotal] = useState(0);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const tabs = [
    { id: "leave", label: "Leave Requests", count: leaveTotal, icon: "🏖️" },
    { id: "expense", label: "Expenses", count: expenseTotal, icon: "💰" },
    { id: "onboarding", label: "Onboarding", count: onboardingTotal, icon: "📋" },
  ];

  // Fetch pending expenses
  const fetchPendingExpenses = async (category = null) => {
    try {
      setExpenseLoading(true);
      const response = await getPendingExpenses(category, 1, 1000); // Get all for filtering

      // Transform API response to match component expectations
      const transformedExpenses = response.expenses.map(expense => ({
        id: expense._id,
        name: expense.user?.name || 'Unknown User',
        category: expense.expenseType,
        amount: expense.amount,
        description: expense.description,
        submittedOn: new Date(expense.createdAt).toISOString().split('T')[0],
        receipts: expense.receipts ? expense.receipts.length : 0,
        status: expense.status,
        department: expense.user?.department || 'Unknown',
        user: expense.user // Keep full user object for additional data
      }));

      setExpenseData(transformedExpenses);
      setExpenseTotal(response.total);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
      setExpenseData([]);
      setExpenseTotal(0);
    } finally {
      setExpenseLoading(false);
    }
  };

  // Fetch pending leave approvals
  const fetchPendingLeaves = async (page = 1) => {
    try {
      setLeaveLoading(true);
      const response = await getPendingLeaveApprovals(page, ITEMS_PER_PAGE);

      // Transform API response to match component expectations
      const transformedLeaves = (response.data || []).map(leave => {
        // Match user from directory API by userId._id
        // Ensure allUsers is an array before using find
        const usersArray = Array.isArray(allUsers) ? allUsers : [];
        const matchedUser = usersArray.find(user => user._id === leave.userId?._id);

        // Use matched user data if available, otherwise fallback to leave.userId
        const userData = matchedUser || leave.userId;

        return {
          id: leave._id,
          name: userData?.name || leave.userId?.name || 'Unknown User',
          type: leave.leaveType ? leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1) : 'Unknown',
          startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
          endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
          days: leave.totalDays || 0,
          reason: leave.reason || '',
          status: leave.status || 'pending',
          department: userData?.department || leave.userId?.department || 'Unknown',
          designation: userData?.designation || leave.userId?.designation || '',
          attachment: leave.attachment,
          createdAt: leave.createdAt,
          userId: leave.userId, // Keep original userId for reference
          matchedUser: matchedUser, // Keep matched user for additional data
        };
      });

      setLeaveData(transformedLeaves);
      setLeaveTotal(response.pagination?.totalCount || transformedLeaves.length);

      // Update pagination state
      if (response.pagination) {
        setLeavePagination({
          currentPage: response.pagination.currentPage || page,
          totalPages: response.pagination.totalPages || 1,
          totalCount: response.pagination.totalCount || 0,
          limit: response.pagination.limit || 10
        });
        setCurrentPage(response.pagination.currentPage || page);
      }
    } catch (error) {
      console.error('Error fetching pending leave approvals:', error);
      setLeaveData([]);
      setLeaveTotal(0);
      setLeavePagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
      });
    } finally {
      setLeaveLoading(false);
    }
  };

  // Fetch all users from directory for name matching
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchEmployees();
        // Handle different response formats - API might return { success: true, users: [...] } or just array
        let users = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response?.users && Array.isArray(response.users)) {
          users = response.users;
        } else if (response?.data && Array.isArray(response.data)) {
          users = response.data;
        }
        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching users for matching:', error);
        setAllUsers([]);
      }
    };
    loadUsers();
  }, []);

  // Map onboarding API response to UI format
  const mapOnboardingToApproval = (onboarding) => {
    // Count documents
    const documentCount = [
      onboarding.resumeUrl,
      onboarding.offerLetterUrl,
      onboarding.salaryBreakupUrl,
    ].filter(Boolean).length;

    console.log("onboarding", onboarding);

    return {
      id: onboarding._id,
      _id: onboarding._id,
      name: onboarding.candidateName || 'Unknown',
      email: onboarding.personalEmail || '',
      department: onboarding.jobDetails?.department || 'Unknown',
      designation: onboarding.jobDetails?.designation || onboarding.jobDetails?.jobTitle || '',
      submittedOn: onboarding.createdAt ? new Date(onboarding.createdAt).toISOString().split('T')[0] : '',
      documents: documentCount,
      status: onboarding.managerApproval || 'pending',
      managerApproval: onboarding.managerApproval,
      managerComments: onboarding.managerComments,
      onboardingStatus: onboarding.status,
      jobDetails: onboarding.jobDetails,
      personalEmail: onboarding.personalEmail,
      phone: onboarding.phone,
      resumeUrl: onboarding.resumeUrl,
      offerLetterUrl: onboarding.offerLetterUrl,
      salaryBreakupUrl: onboarding.salaryBreakupUrl,
    };
  };

  // Fetch pending onboarding employees
  const fetchPendingOnboardings = async () => {
    try {
      setOnboardingLoading(true);
      const response = await onboardingServices.getAllOnboardings();

      if (response.onboardingList && Array.isArray(response.onboardingList)) {
        // Filter for pending manager approval (not approved, not rejected)
        const pendingOnboardings = response.onboardingList.filter(
          onboarding => !onboarding.managerApproval || onboarding.managerApproval === 'pending'
        );

        const transformed = pendingOnboardings.map(mapOnboardingToApproval);
        setOnboardingData(transformed);
        setOnboardingTotal(transformed.length);
      } else {
        setOnboardingData([]);
        setOnboardingTotal(0);
      }
    } catch (error) {
      console.error('Error fetching pending onboardings:', error);
      setOnboardingData([]);
      setOnboardingTotal(0);
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Fetch expense data on mount
  useEffect(() => {
    fetchPendingExpenses();
    fetchPendingLeaves();
    fetchPendingOnboardings();
  }, []);

  // Refetch expenses when category filter changes
  useEffect(() => {
    if (activeTab === "expense") {
      const category = filterExpenseCategory === "All" ? null : filterExpenseCategory;
      fetchPendingExpenses(category);
    }
  }, [filterExpenseCategory, activeTab]);

  // Refetch leaves when tab changes to leave or page changes, or when users are loaded
  useEffect(() => {
    if (activeTab === "leave") {
      fetchPendingLeaves(currentPage);
    }
  }, [activeTab, currentPage, allUsers.length]);

  // Refetch onboarding when tab changes to onboarding
  useEffect(() => {
    if (activeTab === "onboarding") {
      fetchPendingOnboardings();
    }
  }, [activeTab]);

  // Get and filter current data
  const getRawData = () => {
    if (activeTab === "expense") {
      return expenseData;
    }
    if (activeTab === "leave") {
      return leaveData;
    }
    if (activeTab === "onboarding") {
      return onboardingData;
    }
    return [];
  };

  const rawData = getRawData();
  const filteredData = rawData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || item.department === filterDept;

    if (activeTab === "leave") {
      const matchesType = filterLeaveType === "All" || item.type.toLowerCase() === filterLeaveType.toLowerCase();
      return matchesSearch && matchesDept && matchesType;
    }
    if (activeTab === "expense") {
      const matchesCategory = filterExpenseCategory === "All" || item.category === filterExpenseCategory;
      return matchesSearch && matchesCategory;
    }
    return matchesSearch && matchesDept;
  });

  // Pagination - Use API pagination for leave, client-side for others
  const getTotalPages = () => {
    if (activeTab === "leave" && leavePagination.totalPages > 0) {
      return leavePagination.totalPages;
    }
    return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  };

  const totalPages = getTotalPages();

  // For leave tab, use API data directly (already paginated)
  // For other tabs, use client-side pagination
  const paginatedData = activeTab === "leave"
    ? leaveData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filterDept === "All" || item.department === filterDept;
      const matchesType = filterLeaveType === "All" || item.type.toLowerCase() === filterLeaveType.toLowerCase();
      return matchesSearch && matchesDept && matchesType;
    })
    : filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleFilterChange = () => {
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const totalPending = onboardingTotal + leaveTotal + expenseTotal;

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

  const handleAction = async () => {
    if (modalAction === 'reject' && !comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      if (activeTab === 'expense') {
        if (modalItem) {
          // Single item action
          if (modalAction === 'approve') {
            await approveExpense(modalItem.id, comment);
            alert('Expense approved successfully!');
          } else if (modalAction === 'reject') {
            await rejectExpense(modalItem.id, comment);
            alert('Expense rejected successfully!');
          }

          // Remove the processed item from the list
          setExpenseData(prev => prev.filter(item => item.id !== modalItem.id));
          setExpenseTotal(prev => prev - 1);
        } else if (selectedItems.length > 0) {
          // Bulk action - process all selected items
          const promises = selectedItems.map(itemId => {
            if (modalAction === 'approve') {
              return approveExpense(itemId, comment);
            } else if (modalAction === 'reject') {
              return rejectExpense(itemId, comment);
            }
            return Promise.resolve();
          });

          await Promise.all(promises);
          alert(`${selectedItems.length} expenses ${modalAction}d successfully!`);

          // Remove all processed items from the list
          setExpenseData(prev => prev.filter(item => !selectedItems.includes(item.id)));
          setExpenseTotal(prev => prev - selectedItems.length);
        }
      } else if (activeTab === 'leave') {
        if (modalItem) {
          // Single item action
          if (modalAction === 'approve') {
            await approveLeave(modalItem.id, comment);
            alert('Leave request approved successfully!');
          } else if (modalAction === 'reject') {
            if (!comment.trim()) {
              alert('Please provide a reason for rejection');
              return;
            }
            await rejectLeave(modalItem.id, comment);
            alert('Leave request rejected successfully!');
          }

          // Remove the processed item from the list
          setLeaveData(prev => prev.filter(item => item.id !== modalItem.id));
          setLeaveTotal(prev => prev - 1);
        } else if (selectedItems.length > 0) {
          // Bulk action - process all selected items
          if (modalAction === 'reject' && !comment.trim()) {
            alert('Please provide a reason for rejection');
            return;
          }

          const promises = selectedItems.map(itemId => {
            if (modalAction === 'approve') {
              return approveLeave(itemId, comment);
            } else if (modalAction === 'reject') {
              return rejectLeave(itemId, comment);
            }
            return Promise.resolve();
          });

          await Promise.all(promises);
          alert(`${selectedItems.length} leave requests ${modalAction}d successfully!`);

          // Remove all processed items from the list
          setLeaveData(prev => prev.filter(item => !selectedItems.includes(item.id)));
          setLeaveTotal(prev => prev - selectedItems.length);
        }
      } else if (activeTab === 'onboarding') {
        if (modalItem) {
          // Single item action for onboarding
          const action = modalAction === 'approve' ? 'approved' : 'rejected';
          const approvalData = {
            action: action,
            comments: comment.trim() || ''
          };

          await onboardingServices.managerApproveOnboarding(modalItem._id || modalItem.id, approvalData);
          alert(`Onboarding employee ${action} successfully!`);

          // Remove the processed item from the list
          setOnboardingData(prev => prev.filter(item => item.id !== modalItem.id));
          setOnboardingTotal(prev => prev - 1);
        }
      }

      setShowModal(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error processing action:', error);
      alert(`Failed to ${modalAction} request. Please try again.`);
    }
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
    // Reset leave pagination when switching tabs
    if (tabId === "leave") {
      setLeavePagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
      });
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedItems([]);
    // For leave tab, fetch new page from API
    if (activeTab === "leave") {
      fetchPendingLeaves(newPage);
    }
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
    if (!showTeamCalendarModal) return;
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
  }, [showTeamCalendarModal, selectedMonth, selectedYear]);

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
    <>
      <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Approvals Dashboard</h1>
            <p style={{ color: textSecondary }}>Manage onboarding, leave, and expense requests</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "leave" && (
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
            <div
              className="px-4 py-2 rounded-xl"
              style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
            >
              <span className="font-bold text-2xl">{totalPending}</span>
              <span className="ml-2 text-sm">pending approvals</span>
            </div>
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
              <span className="font-bold text-2xl">{totalPending}</span>
              <span className="ml-2 text-sm">pending approvals</span>
            </div>
          ))}
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

        {/* Bulk Actions - Hide for leave and onboarding tabs since no checkboxes */}
        {selectedItems.length > 0 && activeTab !== "leave" && activeTab !== "onboarding" && (
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
            {/* <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded"
            />
            <span className="ml-2 text-sm font-medium" style={{ color: textSecondary }}>Select All</span>
          </label> */}
          </div>

          {/* Items */}
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {((activeTab === "expense" && expenseLoading) || (activeTab === "leave" && leaveLoading) || (activeTab === "onboarding" && onboardingLoading)) ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="font-semibold" style={{ color: textPrimary }}>Loading {activeTab} requests...</p>
              </div>
            ) : paginatedData.length === 0 ? (
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
                          <p className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>{item.type}</span>
                            <span>{item.startDate} → {item.endDate}</span>
                            <span className="font-medium">({item.days} day{item.days > 1 ? 's' : ''})</span>
                          </p>
                          <p className="mt-1">📝 {item.reason}</p>
                          {item.attachment && (
                            <p className="mt-1">
                              <a
                                href={item.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                📎 View Attachment
                              </a>
                            </p>
                          )}
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
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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

      {/* Action Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md p-6 animate-scale-in"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
                {modalAction === 'approve' ? '✓ Approve' : '✗ Reject'} {modalItem ? 'Request' : `${selectedItems.length} Requests`}
              </h2>
            </div>
            <p className="mb-6 font-medium" style={{ color: textPrimary }}>
              Are you sure you want to {modalAction} {modalItem ? 'this request' : `these ${selectedItems.length} requests`}?
            </p>

            {modalItem && (
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <p className="font-bold" style={{ color: textPrimary }}>{modalItem.name}</p>
                <p className="text-sm" style={{ color: textSecondary }}>
                  {activeTab === "onboarding" && [modalItem.department || "Unknown", modalItem.designation].filter(Boolean).join(" – ")}
                  {activeTab === "leave" && `${modalItem.type} (${modalItem.days} days)`}
                  {activeTab === "expense" && `${modalItem.category} - ₹${modalItem.amount.toLocaleString()}`}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20"
                style={{ backgroundColor: modalAction === 'approve' ? '#16a34a' : '#dc2626' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Leave Calendar Modal */}
      {showTeamCalendarModal && (() => {
        const cal = calendarData?.calendarData || {};
        const daysInMonth = calendarData?.daysInMonth ?? new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const firstDayOfMonth = calendarData?.firstDayOfMonth ?? new Date(selectedYear, selectedMonth, 1).getDay();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
    </>
  );
}
