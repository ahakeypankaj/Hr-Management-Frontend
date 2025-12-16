import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getTeamPerformance } from "../../services/performanceService";
import { fetchEmployees } from "../../services/directoryService";

// Data will be fetched from API

const tabs = ["Goals", "Reviews", "Team Scores"];
const goalStatuses = ["All", "pending", "self_review_done", "reviewed"];
const reviewStatuses = ["All", "pending", "in_progress", "completed"];
const ITEMS_PER_PAGE = 10;

export default function PerformanceHub() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("Goals");

  // API Data States
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Map API response to goals format
  const mapToGoals = (teamData) => {
    const goals = [];
    teamData.forEach((performance) => {
      if (performance.goals && performance.goals.length > 0) {
        performance.goals.forEach((goal, index) => {
          goals.push({
            id: `${performance._id}-${index}`,
            performanceId: performance._id,
            empId: performance.userId?.employeeId || 'N/A',
            empName: performance.userId?.name || 'Unknown',
            goal: goal.title || '',
            description: goal.description || '',
            weight: goal.weightage || 0,
            selfScore: goal.selfRating || null,
            managerScore: goal.managerRating || null,
            status: getGoalStatus(performance.status, goal),
            deadline: performance.cycleId ? 'TBD' : 'N/A',
            department: performance.userId?.department || 'Unknown',
            comments: goal.comments || '',
          });
        });
      }
    });
    return goals;
  };

  // Map API response to reviews format
  const mapToReviews = (teamData) => {
    return teamData.map((performance) => {
      const hasSelfReview = performance.goals?.some(g => g.selfRating) || false;
      const hasManagerReview = performance.goals?.some(g => g.managerRating) || false;
      
      return {
        id: performance._id,
        performanceId: performance._id,
        empId: performance.userId?.employeeId || 'N/A',
        empName: performance.userId?.name || 'Unknown',
        dept: performance.userId?.department || 'Unknown',
        cycle: performance.cycleId || 'N/A',
        selfReview: hasSelfReview,
        managerReview: hasManagerReview,
        peerFeedback: 0, // Not in API response
        finalScore: performance.overallRating || null,
        status: mapPerformanceStatus(performance.status),
      };
    });
  };

  // Map performance status to UI status
  const mapPerformanceStatus = (status) => {
    const statusMap = {
      'goal-setting': 'pending',
      'self-review': 'in_progress',
      'manager-review': 'in_progress',
      'manager-submitted': 'in_progress',
      'completed': 'completed',
    };
    return statusMap[status] || 'pending';
  };

  // Get goal status based on performance status and goal data
  const getGoalStatus = (performanceStatus, goal) => {
    if (performanceStatus === 'completed' || (goal.managerRating && goal.selfRating)) {
      return 'reviewed';
    }
    if (goal.selfRating && !goal.managerRating) {
      return 'self_review_done';
    }
    return 'pending';
  };

  // Fetch team performance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch team performance
        const performanceResponse = await getTeamPerformance();
        const teamData = performanceResponse.team || performanceResponse || [];
        setTeamPerformance(teamData);

        // Fetch all employees for dropdowns
        const employeesResponse = await fetchEmployees();
        let employees = [];
        if (Array.isArray(employeesResponse)) {
          employees = employeesResponse;
        } else if (employeesResponse?.users && Array.isArray(employeesResponse.users)) {
          employees = employeesResponse.users;
        } else if (employeesResponse?.data && Array.isArray(employeesResponse.data)) {
          employees = employeesResponse.data;
        }
        setAllEmployees(employees);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to load performance data');
        setTeamPerformance([]);
        setAllEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique departments from employees
  const getDepartments = () => {
    const depts = new Set(['All']);
    allEmployees.forEach(emp => {
      if (emp.department) depts.add(emp.department);
    });
    return Array.from(depts);
  };

  const departments = getDepartments();

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
    let data = [];
    
    if (activeTab === "Goals") {
      data = mapToGoals(teamPerformance);
    } else if (activeTab === "Reviews") {
      data = mapToReviews(teamPerformance);
    }
    
    // Search filter
    if (searchQuery) {
      data = data.filter(item => item.empName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
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

  // Calculate stats from API data
  const goals = mapToGoals(teamPerformance);
  const reviews = mapToReviews(teamPerformance);
  const completedReviews = reviews.filter(r => r.finalScore);
  
  const avgScore = completedReviews.length > 0
    ? (completedReviews.reduce((sum, r) => sum + r.finalScore, 0) / completedReviews.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total Goals", value: goals.length, color: "#2563eb", icon: "🎯" },
    { label: "Pending Reviews", value: reviews.filter(r => r.status !== "completed").length, color: "#ea580c", icon: "📝" },
    { label: "Completed Reviews", value: completedReviews.length, color: "#16a34a", icon: "✅" },
    { label: "Avg Team Score", value: avgScore, color: "#7c3aed", icon: "📊" },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Performance Hub</h1>
          <p style={{ color: textSecondary }}>Manage goals, reviews, and performance scores</p>
        </div>
        <button 
          className="px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90" 
          style={{ backgroundColor: navyBlue, boxShadow: `0 4px 15px ${navyBlue}40` }}
        >
          + Assign New Goal
        </button>
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

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center" style={cardStyle}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="font-semibold" style={{ color: textPrimary }}>Loading performance data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 rounded-xl" style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626' }}>
          <p className="font-semibold text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Goals Tab */}
      {!isLoading && !error && activeTab === "Goals" && (
        <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-6" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Employee Goals</h2>
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
      {!isLoading && !error && activeTab === "Reviews" && (
        <div style={cardStyle} className="overflow-hidden animate-fade-in-up stagger-2">
          <div className="p-6" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Performance Reviews</h2>
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
                          <button className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: navyBlue }}>
                            Review
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
      {!isLoading && !error && activeTab === "Team Scores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up stagger-2">
          {completedReviews.length === 0 ? (
            <div className="col-span-2 p-12 text-center" style={cardStyle}>
              <span className="text-4xl block mb-2">📊</span>
              <p style={{ color: textSecondary }}>No completed reviews yet</p>
            </div>
          ) : (
            completedReviews.map((review) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
}
