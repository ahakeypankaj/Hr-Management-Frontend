import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { createPerformanceCycle, assignPerformance, assignGoalsToEmployee, submitSelfReview, submitManagerReview } from "../../services/performanceService";

const mockGoals = [
  { id: 1, empId: "EMP001", empName: "Asha Kumar", goal: "Complete React migration", weight: 30, selfScore: 4.5, managerScore: 4.2, status: "reviewed", deadline: "2024-12-31", department: "Engineering" },
  { id: 2, empId: "EMP001", empName: "Asha Kumar", goal: "Mentor 2 junior developers", weight: 20, selfScore: 4.0, managerScore: 4.5, status: "reviewed", deadline: "2024-12-31", department: "Engineering" },
  { id: 3, empId: "EMP003", empName: "Priya Patel", goal: "Redesign dashboard UI", weight: 40, selfScore: 4.8, managerScore: null, status: "self_review_done", deadline: "2024-12-31", department: "Engineering" },
  { id: 4, empId: "EMP004", empName: "Vikram Singh", goal: "Setup CI/CD pipeline", weight: 35, selfScore: null, managerScore: null, status: "pending", deadline: "2024-12-31", department: "DevOps" },
  { id: 5, empId: "EMP008", empName: "Amit Kumar", goal: "API optimization", weight: 25, selfScore: 4.2, managerScore: 4.0, status: "reviewed", deadline: "2024-12-31", department: "Engineering" },
  { id: 6, empId: "EMP005", empName: "Anita Verma", goal: "Implement test automation", weight: 30, selfScore: 4.3, managerScore: 4.1, status: "reviewed", deadline: "2024-12-31", department: "QA" },
  { id: 7, empId: "EMP006", empName: "Rahul Gupta", goal: "Close 10 enterprise deals", weight: 50, selfScore: 3.8, managerScore: null, status: "self_review_done", deadline: "2024-12-31", department: "Sales" },
  { id: 8, empId: "EMP009", empName: "Neha Sharma", goal: "Launch new product feature", weight: 45, selfScore: null, managerScore: null, status: "pending", deadline: "2024-12-31", department: "Product" },
];

const mockReviews = [
  { id: 1, empId: "EMP001", empName: "Asha Kumar", dept: "Engineering", cycle: "Q4 2024", selfReview: true, managerReview: true, peerFeedback: 3, finalScore: 4.3, status: "completed" },
  { id: 2, empId: "EMP003", empName: "Priya Patel", dept: "Engineering", cycle: "Q4 2024", selfReview: true, managerReview: false, peerFeedback: 2, finalScore: null, status: "in_progress" },
  { id: 3, empId: "EMP004", empName: "Vikram Singh", dept: "DevOps", cycle: "Q4 2024", selfReview: false, managerReview: false, peerFeedback: 0, finalScore: null, status: "pending" },
  { id: 4, empId: "EMP005", empName: "Anita Verma", dept: "QA", cycle: "Q4 2024", selfReview: true, managerReview: true, peerFeedback: 4, finalScore: 4.1, status: "completed" },
  { id: 5, empId: "EMP006", empName: "Rahul Gupta", dept: "Sales", cycle: "Q4 2024", selfReview: true, managerReview: false, peerFeedback: 1, finalScore: null, status: "in_progress" },
  { id: 6, empId: "EMP008", empName: "Amit Kumar", dept: "Engineering", cycle: "Q4 2024", selfReview: true, managerReview: true, peerFeedback: 3, finalScore: 4.0, status: "completed" },
];

const tabs = ["Goals", "Reviews", "Team Scores"];
const departments = ["All", "Engineering", "DevOps", "QA", "Sales", "Product"];
const goalStatuses = ["All", "pending", "self_review_done", "reviewed"];
const reviewStatuses = ["All", "pending", "in_progress", "completed"];
const ITEMS_PER_PAGE = 5;

// Mock data for employees and cycles (replace with API calls later)
const mockEmployees = [
  { id: "693c1fc4035ed55e8aebbc25", name: "Asha Kumar", department: "Engineering" },
  { id: "693bde395baed01108cae8b9", name: "Ravi Sharma", department: "HR" },
  { id: "693c6c7552775f1a5983db8d", name: "Priya Patel", department: "Engineering" },
];

const mockCycles = [
  { id: "667b1af9e23da437e8c99822", name: "2025-Q1 Review" },
  { id: "693c6bd252775f1a5983db8a", name: "2024-Q4 Review" },
];

export default function PerformanceHub() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("Goals");

  // Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Performance Cycle Modal
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cycleForm, setCycleForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    stages: {
      goalSetting: "",
      selfReview: "",
      managerReview: "",
      calibration: "",
      finalization: ""
    }
  });

  // Assign Performance Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");
  const [assignForm, setAssignForm] = useState({
    userId: "",
    reviewerId: "",
    cycleId: "",
    goals: [],
    status: "goal-setting"
  });

  // Assign Goals Modal
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState("");
  const [goalsSuccess, setGoalsSuccess] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [goalsForm, setGoalsForm] = useState([
    { title: "", description: "", weightage: "" }
  ]);

  // Self Review Modal
  const [showSelfReviewModal, setShowSelfReviewModal] = useState(false);
  const [selfReviewLoading, setSelfReviewLoading] = useState(false);
  const [selfReviewError, setSelfReviewError] = useState("");
  const [selfReviewSuccess, setSelfReviewSuccess] = useState("");
  const [selfReviewEmployeeId, setSelfReviewEmployeeId] = useState("");
  const [selfReviewForm, setSelfReviewForm] = useState([]);

  // Manager Review Modal
  const [showManagerReviewModal, setShowManagerReviewModal] = useState(false);
  const [managerReviewLoading, setManagerReviewLoading] = useState(false);
  const [managerReviewError, setManagerReviewError] = useState("");
  const [managerReviewSuccess, setManagerReviewSuccess] = useState("");
  const [managerReviewEmployeeId, setManagerReviewEmployeeId] = useState("");
  const [managerReviewForm, setManagerReviewForm] = useState([]);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#d97706" },
      self_review_done: { bg: "#dbeafe", color: "#2563eb" },
      in_progress: { bg: "#dbeafe", color: "#2563eb" },
      reviewed: { bg: "#dcfce7", color: "#16a34a" },
      completed: { bg: "#dcfce7", color: "#16a34a" },
    };
    return styles[status] || { bg: "#f1f5f9", color: "#64748b" };
  };

  const getScoreColor = (score) => {
    if (!score) return textSecondary;
    if (score >= 4.5) return "#16a34a";
    if (score >= 3.5) return "#2563eb";
    if (score >= 2.5) return "#d97706";
    return "#dc2626";
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let data = activeTab === "Goals" ? mockGoals : mockReviews;
    
    // Search filter
    data = data.filter(item => item.empName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Department filter
    if (filterDept !== "All") {
      data = data.filter(item => item.department === filterDept || item.dept === filterDept);
    }
    
    // Status filter
    if (filterStatus !== "All") {
      data = data.filter(item => item.status === filterStatus);
    }
    
    return data;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setFilterDept("All");
    setFilterStatus("All");
    setSearchQuery("");
  };

  const stats = [
    { label: "Total Goals", value: mockGoals.length, color: "#2563eb", icon: "🎯" },
    { label: "Pending Reviews", value: mockReviews.filter(r => r.status !== "completed").length, color: "#ea580c", icon: "📝" },
    { label: "Completed Reviews", value: mockReviews.filter(r => r.status === "completed").length, color: "#16a34a", icon: "✅" },
    { label: "Avg Team Score", value: "4.2", color: "#7c3aed", icon: "📊" },
  ];

  const completedReviews = mockReviews.filter(r => r.finalScore);

  const handleCycleFormChange = (field, value) => {
    if (field.startsWith('stages.')) {
      const stageField = field.split('.')[1];
      setCycleForm(prev => ({
        ...prev,
        stages: {
          ...prev.stages,
          [stageField]: value
        }
      }));
    } else {
      setCycleForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createPerformanceCycle(cycleForm);
      setSuccess("Performance cycle created successfully!");
      // Reset form
      setCycleForm({
        name: "",
        startDate: "",
        endDate: "",
        stages: {
          goalSetting: "",
          selfReview: "",
          managerReview: "",
          calibration: "",
          finalization: ""
        }
      });
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCycleModal(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create performance cycle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCycleModal(false);
    setError("");
    setSuccess("");
    setCycleForm({
      name: "",
      startDate: "",
      endDate: "",
      stages: {
        goalSetting: "",
        selfReview: "",
        managerReview: "",
        calibration: "",
        finalization: ""
      }
    });
  };

  // Assign Performance Handlers
  const handleAssignFormChange = (field, value) => {
    setAssignForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignPerformance = async (e) => {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    setAssignLoading(true);

    try {
      await assignPerformance(assignForm);
      setAssignSuccess("Performance review assigned successfully!");
      setAssignForm({
        userId: "",
        reviewerId: "",
        cycleId: "",
        goals: [],
        status: "goal-setting"
      });
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess("");
      }, 2000);
    } catch (err) {
      setAssignError(err.message || "Failed to assign performance review. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setAssignError("");
    setAssignSuccess("");
    setAssignForm({
      userId: "",
      reviewerId: "",
      cycleId: "",
      goals: [],
      status: "goal-setting"
    });
  };

  // Assign Goals Handlers
  const handleGoalsFormChange = (index, field, value) => {
    const updatedGoals = [...goalsForm];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setGoalsForm(updatedGoals);
  };

  const handleAddGoal = () => {
    setGoalsForm([...goalsForm, { title: "", description: "", weightage: "" }]);
  };

  const handleRemoveGoal = (index) => {
    if (goalsForm.length > 1) {
      setGoalsForm(goalsForm.filter((_, i) => i !== index));
    }
  };

  const handleAssignGoals = async (e) => {
    e.preventDefault();
    setGoalsError("");
    setGoalsSuccess("");
    setGoalsLoading(true);

    try {
      // Validate weightage totals to 100
      const totalWeightage = goalsForm.reduce((sum, goal) => sum + (parseFloat(goal.weightage) || 0), 0);
      if (Math.abs(totalWeightage - 100) > 0.01) {
        throw new Error("Total weightage must equal 100%");
      }

      const goalsData = {
        goals: goalsForm.map(goal => ({
          title: goal.title,
          description: goal.description,
          weightage: parseFloat(goal.weightage)
        }))
      };

      await assignGoalsToEmployee(selectedEmployeeId, goalsData);
      setGoalsSuccess("Goals assigned successfully!");
      setGoalsForm([{ title: "", description: "", weightage: "" }]);
      setSelectedEmployeeId("");
      setTimeout(() => {
        setShowGoalsModal(false);
        setGoalsSuccess("");
      }, 2000);
    } catch (err) {
      setGoalsError(err.message || "Failed to assign goals. Please try again.");
    } finally {
      setGoalsLoading(false);
    }
  };

  const handleCloseGoalsModal = () => {
    setShowGoalsModal(false);
    setGoalsError("");
    setGoalsSuccess("");
    setGoalsForm([{ title: "", description: "", weightage: "" }]);
    setSelectedEmployeeId("");
  };

  // Self Review Handlers
  const handleSelfReviewChange = (index, value) => {
    const updated = [...selfReviewForm];
    updated[index] = { selfRating: parseFloat(value) };
    setSelfReviewForm(updated);
  };

  const handleSubmitSelfReview = async (e) => {
    e.preventDefault();
    setSelfReviewError("");
    setSelfReviewSuccess("");
    setSelfReviewLoading(true);

    try {
      const reviewData = { goals: selfReviewForm };
      await submitSelfReview(selfReviewEmployeeId, reviewData);
      setSelfReviewSuccess("Self-review submitted successfully!");
      setSelfReviewForm([]);
      setSelfReviewEmployeeId("");
      setTimeout(() => {
        setShowSelfReviewModal(false);
        setSelfReviewSuccess("");
      }, 2000);
    } catch (err) {
      setSelfReviewError(err.message || "Failed to submit self-review. Please try again.");
    } finally {
      setSelfReviewLoading(false);
    }
  };

  const handleCloseSelfReviewModal = () => {
    setShowSelfReviewModal(false);
    setSelfReviewError("");
    setSelfReviewSuccess("");
    setSelfReviewForm([]);
    setSelfReviewEmployeeId("");
  };

  const handleOpenGoalsModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowGoalsModal(true);
  };

  const handleOpenSelfReviewModal = (employeeId, goalsCount) => {
    setSelfReviewEmployeeId(employeeId);
    // Initialize form with empty ratings for each goal
    setSelfReviewForm(Array(goalsCount).fill(null).map(() => ({ selfRating: null })));
    setShowSelfReviewModal(true);
  };

  // Manager Review Handlers
  const handleManagerReviewChange = (index, field, value) => {
    const updated = [...managerReviewForm];
    updated[index] = { ...updated[index], [field]: value };
    setManagerReviewForm(updated);
  };

  const handleSubmitManagerReview = async (e) => {
    e.preventDefault();
    setManagerReviewError("");
    setManagerReviewSuccess("");
    setManagerReviewLoading(true);

    try {
      const reviewData = { goals: managerReviewForm };
      await submitManagerReview(managerReviewEmployeeId, reviewData);
      setManagerReviewSuccess("Manager review submitted successfully!");
      setManagerReviewForm([]);
      setManagerReviewEmployeeId("");
      setTimeout(() => {
        setShowManagerReviewModal(false);
        setManagerReviewSuccess("");
      }, 2000);
    } catch (err) {
      setManagerReviewError(err.message || "Failed to submit manager review. Please try again.");
    } finally {
      setManagerReviewLoading(false);
    }
  };

  const handleCloseManagerReviewModal = () => {
    setShowManagerReviewModal(false);
    setManagerReviewError("");
    setManagerReviewSuccess("");
    setManagerReviewForm([]);
    setManagerReviewEmployeeId("");
  };

  const handleOpenManagerReviewModal = (employeeId, goalsCount) => {
    setManagerReviewEmployeeId(employeeId);
    // Initialize form with empty ratings and comments for each goal
    setManagerReviewForm(Array(goalsCount).fill(null).map(() => ({ managerRating: null, comments: "" })));
    setShowManagerReviewModal(true);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Performance Hub</h1>
          <p style={{ color: textSecondary }}>Manage goals, reviews, and performance scores</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90" 
            style={{ backgroundColor: '#16a34a', boxShadow: `0 4px 15px #16a34a40` }}
          >
            + Assign Performance
          </button>
          <button 
            onClick={() => setShowCycleModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90" 
            style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
          >
            + Create New Performance
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {stats.map((stat, index) => (
          <div key={index} className="p-5 hover-lift" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${stat.color}20` }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-fade-in-up">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
              color: activeTab === tab ? '#ffffff' : textSecondary
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters (for Goals and Reviews tabs) */}
      {(activeTab === "Goals" || activeTab === "Reviews") && (
        <div className="p-4 animate-fade-in-up" style={cardStyle}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔍</span>
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
                style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
              />
            </div>
            
            {/* Department Filter */}
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

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
              className="px-4 py-3 rounded-xl outline-none font-medium"
              style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
            >
              {(activeTab === "Goals" ? goalStatuses : reviewStatuses).map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Status" : s.replace("_", " ").toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 text-sm" style={{ color: textSecondary }}>
            Showing {paginatedData.length} of {filteredData.length} records
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === "Goals" && (
        <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Employee Goals - Q4 2024</h2>
            <button 
              onClick={() => setShowGoalsModal(true)}
              className="px-4 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm" 
              style={{ backgroundColor: '#7c3aed', boxShadow: `0 4px 15px #7c3aed40` }}
            >
              + Assign Goals
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <tr>
                  {["Employee", "Goal", "Weight", "Self Score", "Manager Score", "Status", "Deadline"].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <span className="text-4xl block mb-2">🎯</span>
                      <p style={{ color: textSecondary }}>No goals found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((goal) => {
                    const statusStyle = getStatusStyle(goal.status);
                    return (
                      <tr key={goal.id} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                              {goal.empName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: textPrimary }}>{goal.empName}</p>
                              <p className="text-xs" style={{ color: textSecondary }}>{goal.empId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium" style={{ color: textPrimary }}>{goal.goal}</td>
                        <td className="px-6 py-4 font-bold" style={{ color: '#2563eb' }}>{goal.weight}%</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg" style={{ color: getScoreColor(goal.selfScore) }}>
                            {goal.selfScore || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg" style={{ color: getScoreColor(goal.managerScore) }}>
                            {goal.managerScore || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            {goal.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: textSecondary }}>{goal.deadline}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
      )}

      {/* Reviews Tab */}
      {activeTab === "Reviews" && (
        <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Performance Reviews - Q4 2024</h2>
            <button 
              onClick={() => {
                // Default to first employee with 3 goals - in real app, this would be selected from a dropdown
                const employeeId = mockEmployees[0]?.id || "";
                handleOpenManagerReviewModal(employeeId, 3);
              }}
              className="px-4 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm" 
              style={{ backgroundColor: '#ea580c', boxShadow: `0 4px 15px #ea580c40` }}
            >
              + Manager Review
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {paginatedData.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-4xl block mb-2">📝</span>
                <p style={{ color: textSecondary }}>No reviews found</p>
              </div>
            ) : (
              paginatedData.map((review) => {
                const statusStyle = getStatusStyle(review.status);
                return (
                  <div key={review.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                          {review.empName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: textPrimary }}>{review.empName}</h3>
                          <p className="text-sm" style={{ color: textSecondary }}>{review.dept} • {review.cycle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* Review Progress */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span style={{ color: review.selfReview ? '#16a34a' : textSecondary }}>{review.selfReview ? '✅' : '⏳'}</span>
                            <span style={{ color: textSecondary }}>Self</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: review.managerReview ? '#16a34a' : textSecondary }}>{review.managerReview ? '✅' : '⏳'}</span>
                            <span style={{ color: textSecondary }}>Manager</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: review.peerFeedback > 0 ? '#16a34a' : textSecondary }}>{review.peerFeedback > 0 ? '✅' : '⏳'}</span>
                            <span style={{ color: textSecondary }}>Peers ({review.peerFeedback})</span>
                          </div>
                        </div>
                        {/* Final Score */}
                        {review.finalScore && (
                          <div className="text-center">
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(review.finalScore) }}>{review.finalScore}</p>
                            <p className="text-xs" style={{ color: textSecondary }}>Final Score</p>
                          </div>
                        )}
                        {/* Status */}
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {review.status.replace("_", " ").toUpperCase()}
                        </span>
                        {/* Actions */}
                        {review.status !== "completed" && (
                          <button 
                            onClick={() => {
                              // Use mock employee ID - in real app, this would come from review data
                              const employeeId = mockEmployees[0]?.id || "";
                              handleOpenManagerReviewModal(employeeId, 3);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90" 
                            style={{ backgroundColor: '#2563eb' }}
                          >
                            Manager Review
                          </button>
                        )}
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
      )}

      {/* Team Scores Tab */}
      {activeTab === "Team Scores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up stagger-2">
          {completedReviews.map((review) => (
            <div key={review.id} className="p-6 hover-lift" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                    {review.empName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{review.empName}</h3>
                    <p className="text-sm" style={{ color: textSecondary }}>{review.dept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold" style={{ color: getScoreColor(review.finalScore) }}>{review.finalScore}</p>
                  <p className="text-sm" style={{ color: textSecondary }}>out of 5.0</p>
                </div>
              </div>
              {/* Score Bar */}
              <div className="mt-4">
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <div 
                    className="h-3 rounded-full transition-all"
                    style={{ 
                      width: `${(review.finalScore / 5) * 100}%`,
                      backgroundColor: getScoreColor(review.finalScore)
                    }}
                  ></div>
                </div>
              </div>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: textPrimary }}>3</p>
                  <p className="text-xs" style={{ color: textSecondary }}>Goals Met</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: textPrimary }}>95%</p>
                  <p className="text-xs" style={{ color: textSecondary }}>Attendance</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: textPrimary }}>{review.peerFeedback}</p>
                  <p className="text-xs" style={{ color: textSecondary }}>Peer Reviews</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Cycle Creation Modal */}
      {showCycleModal && (
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
                    📊
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create New Performance Cycle</h2>
                    <p className="text-blue-200 text-sm">Set up a new performance review cycle</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateCycle} className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  {success}
                </div>
              )}

              {/* Cycle Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Cycle Name *
                </label>
                <input
                  type="text"
                  required
                  value={cycleForm.name}
                  onChange={(e) => handleCycleFormChange('name', e.target.value)}
                  placeholder="e.g., 2025-Q1 Review"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleForm.startDate}
                    onChange={(e) => handleCycleFormChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleForm.endDate}
                    onChange={(e) => handleCycleFormChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>

              {/* Stages Section */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Stage Dates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                      Goal Setting *
                    </label>
                    <input
                      type="date"
                      required
                      value={cycleForm.stages.goalSetting}
                      onChange={(e) => handleCycleFormChange('stages.goalSetting', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                      Self Review *
                    </label>
                    <input
                      type="date"
                      required
                      value={cycleForm.stages.selfReview}
                      onChange={(e) => handleCycleFormChange('stages.selfReview', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                      Manager Review *
                    </label>
                    <input
                      type="date"
                      required
                      value={cycleForm.stages.managerReview}
                      onChange={(e) => handleCycleFormChange('stages.managerReview', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                      Calibration *
                    </label>
                    <input
                      type="date"
                      required
                      value={cycleForm.stages.calibration}
                      onChange={(e) => handleCycleFormChange('stages.calibration', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                      Finalization *
                    </label>
                    <input
                      type="date"
                      required
                      value={cycleForm.stages.finalization}
                      onChange={(e) => handleCycleFormChange('stages.finalization', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
                >
                  {loading ? "Creating..." : "Create Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Performance Modal */}
      {showAssignModal && (
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
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Assign Performance Review</h2>
                    <p className="text-green-200 text-sm">Assign a performance review to an employee</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseAssignModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignPerformance} className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Error/Success Messages */}
              {assignError && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  {assignError}
                </div>
              )}
              {assignSuccess && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  {assignSuccess}
                </div>
              )}

              {/* User ID (Employee) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Employee (User ID) *
                </label>
                <select
                  required
                  value={assignForm.userId}
                  onChange={(e) => handleAssignFormChange('userId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select Employee</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department}) - {emp.id}</option>
                  ))}
                </select>
              </div>

              {/* Reviewer ID (Manager) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Reviewer/Manager (User ID) *
                </label>
                <select
                  required
                  value={assignForm.reviewerId}
                  onChange={(e) => handleAssignFormChange('reviewerId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select Reviewer</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department}) - {emp.id}</option>
                  ))}
                </select>
              </div>

              {/* Cycle ID */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Performance Cycle *
                </label>
                <select
                  required
                  value={assignForm.cycleId}
                  onChange={(e) => handleAssignFormChange('cycleId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select Performance Cycle</option>
                  {mockCycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>{cycle.name} - {cycle.id}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Status *
                </label>
                <select
                  required
                  value={assignForm.status}
                  onChange={(e) => handleAssignFormChange('status', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="goal-setting">Goal Setting</option>
                  <option value="self-review">Self Review</option>
                  <option value="manager-review">Manager Review</option>
                  <option value="calibration">Calibration</option>
                  <option value="finalization">Finalization</option>
                </select>
              </div>

              {/* Info Note */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                <p className="text-sm font-medium mb-1" style={{ color: textPrimary }}>Goals</p>
                <p className="text-xs" style={{ color: textSecondary }}>
                  Goals array is initialized as empty. Goals can be assigned later using the "Assign Goals" feature.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className="flex-1 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  disabled={assignLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#16a34a', boxShadow: `0 4px 15px #16a34a40` }}
                >
                  {assignLoading ? "Assigning..." : "Assign Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Goals Modal */}
      {showGoalsModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-3xl animate-scale-in"
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
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Assign Goals to Employee</h2>
                    <p className="text-purple-200 text-sm">Set performance goals for the employee</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseGoalsModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignGoals} className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Error/Success Messages */}
              {goalsError && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  {goalsError}
                </div>
              )}
              {goalsSuccess && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  {goalsSuccess}
                </div>
              )}

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Employee (User ID) *
                </label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none font-medium"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                >
                  <option value="">Select Employee</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department}) - {emp.id}</option>
                  ))}
                </select>
              </div>

              {/* Goals List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: textPrimary }}>Goals</h3>
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-4 py-2 rounded-xl font-medium text-white"
                    style={{ backgroundColor: '#7c3aed' }}
                  >
                    + Add Goal
                  </button>
                </div>
                <div className="space-y-4">
                  {goalsForm.map((goal, index) => (
                    <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold" style={{ color: textPrimary }}>Goal {index + 1}</span>
                        {goalsForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Title *</label>
                          <input
                            type="text"
                            required
                            value={goal.title}
                            onChange={(e) => handleGoalsFormChange(index, 'title', e.target.value)}
                            placeholder="e.g., Improve Backend API Performance"
                            className="w-full px-4 py-2 rounded-lg outline-none text-sm"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Description *</label>
                          <textarea
                            required
                            value={goal.description}
                            onChange={(e) => handleGoalsFormChange(index, 'description', e.target.value)}
                            placeholder="e.g., Reduce response times by 30%"
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg outline-none text-sm resize-none"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Weightage (%) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.1"
                            value={goal.weightage}
                            onChange={(e) => handleGoalsFormChange(index, 'weightage', e.target.value)}
                            placeholder="e.g., 40"
                            className="w-full px-4 py-2 rounded-lg outline-none text-sm"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm font-medium" style={{ color: textPrimary }}>
                  Total Weightage: {goalsForm.reduce((sum, goal) => sum + (parseFloat(goal.weightage) || 0), 0).toFixed(1)}%
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={handleCloseGoalsModal}
                  className="flex-1 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  disabled={goalsLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={goalsLoading}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#7c3aed', boxShadow: `0 4px 15px #7c3aed40` }}
                >
                  {goalsLoading ? "Assigning..." : "Assign Goals"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Self Review Modal */}
      {showSelfReviewModal && (
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
                    ✍️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Employee Self Review</h2>
                    <p className="text-blue-200 text-sm">Submit your self-review ratings</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseSelfReviewModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitSelfReview} className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Error/Success Messages */}
              {selfReviewError && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  {selfReviewError}
                </div>
              )}
              {selfReviewSuccess && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  {selfReviewSuccess}
                </div>
              )}

              {/* Employee ID Display */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Employee (User ID)
                </label>
                <input
                  type="text"
                  value={selfReviewEmployeeId}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textSecondary }}
                />
              </div>

              {/* Self Ratings */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Self Ratings</h3>
                <div className="space-y-4">
                  {selfReviewForm.map((rating, index) => (
                    <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold" style={{ color: textPrimary }}>Goal {index + 1}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: textSecondary }}>Self Rating (1-5) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="5"
                          step="0.1"
                          value={rating.selfRating || ''}
                          onChange={(e) => handleSelfReviewChange(index, e.target.value)}
                          placeholder="Enter rating (1-5)"
                          className="w-full px-4 py-2 rounded-lg outline-none text-sm"
                          style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={handleCloseSelfReviewModal}
                  className="flex-1 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  disabled={selfReviewLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selfReviewLoading}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#2563eb', boxShadow: `0 4px 15px #2563eb40` }}
                >
                  {selfReviewLoading ? "Submitting..." : "Submit Self Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager Review Modal */}
      {showManagerReviewModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-3xl animate-scale-in"
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
                    👔
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Manager Review</h2>
                    <p className="text-orange-200 text-sm">Submit manager review with ratings and comments</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseManagerReviewModal}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitManagerReview} className="p-6 overflow-y-auto space-y-5" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              {/* Error/Success Messages */}
              {managerReviewError && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  {managerReviewError}
                </div>
              )}
              {managerReviewSuccess && (
                <div className="p-4 rounded-xl text-sm font-medium" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  {managerReviewSuccess}
                </div>
              )}

              {/* Employee ID Display */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>
                  Employee (User ID)
                </label>
                <input
                  type="text"
                  value={managerReviewEmployeeId}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textSecondary }}
                />
              </div>

              {/* Manager Ratings and Comments */}
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Manager Review</h3>
                <div className="space-y-4">
                  {managerReviewForm.map((review, index) => (
                    <div key={index} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold" style={{ color: textPrimary }}>Goal {index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: textSecondary }}>Manager Rating (1-5) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="5"
                            step="0.1"
                            value={review.managerRating || ''}
                            onChange={(e) => handleManagerReviewChange(index, 'managerRating', e.target.value)}
                            placeholder="Enter rating (1-5)"
                            className="w-full px-4 py-2 rounded-lg outline-none text-sm"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: textSecondary }}>Comments *</label>
                          <textarea
                            required
                            value={review.comments}
                            onChange={(e) => handleManagerReviewChange(index, 'comments', e.target.value)}
                            placeholder="e.g., Good improvement. Need more consistency."
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg outline-none text-sm resize-none"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  type="button"
                  onClick={handleCloseManagerReviewModal}
                  className="flex-1 px-5 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                  disabled={managerReviewLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={managerReviewLoading}
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#ea580c', boxShadow: `0 4px 15px #ea580c40` }}
                >
                  {managerReviewLoading ? "Submitting..." : "Submit Manager Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
