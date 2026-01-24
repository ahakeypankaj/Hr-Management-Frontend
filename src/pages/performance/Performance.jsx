import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DonutChart from "../../components/charts/DonutChart";
import { getMyPerformance, submitSelfReview } from "../../services/performanceService";

// Mock goals data
const mockGoals = [
  { id: 1, title: "Complete React Training", description: "Finish advanced React course on Udemy", deadline: "2024-12-31", progress: 75, weight: 20, status: "in_progress" },
  { id: 2, title: "Deliver Feature X", description: "Complete the new dashboard module", deadline: "2024-12-20", progress: 90, weight: 30, status: "in_progress" },
  { id: 3, title: "Code Review Participation", description: "Review at least 20 PRs this quarter", deadline: "2024-12-31", progress: 60, weight: 15, status: "in_progress" },
  { id: 4, title: "Documentation Update", description: "Update API documentation for v2", deadline: "2024-11-30", progress: 100, weight: 15, status: "completed" },
  { id: 5, title: "Mentoring", description: "Mentor 2 junior developers", deadline: "2024-12-31", progress: 50, weight: 20, status: "in_progress" },
];

// Mock performance history
const performanceHistory = [
  { period: "Q3 2024", score: 4.2, rating: "Exceeds Expectations", feedback: "Excellent work on the migration project. Great team collaboration.", reviewedBy: "Ravi Sharma" },
  { period: "Q2 2024", score: 3.8, rating: "Meets Expectations", feedback: "Good progress on technical skills. Focus more on documentation.", reviewedBy: "Ravi Sharma" },
  { period: "Q1 2024", score: 4.0, rating: "Meets Expectations", feedback: "Consistent performer. Keep up the good work!", reviewedBy: "Ravi Sharma" },
];

// Mock self-review form
const selfReviewQuestions = [
  { id: 1, question: "What were your key achievements this quarter?", type: "textarea" },
  { id: 2, question: "What challenges did you face?", type: "textarea" },
  { id: 3, question: "Rate your overall performance (1-5)", type: "rating" },
  { id: 4, question: "What are your goals for next quarter?", type: "textarea" },
];

export default function Performance() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState("goals");
  const [myPerformance, setMyPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPerformance, setCurrentPerformance] = useState(null);
  const [selfReviewRatings, setSelfReviewRatings] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    const fetchMyPerformance = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getMyPerformance();
        const perfList = response?.perf || [];
        setMyPerformance(perfList);
        const active = perfList.find((p) => p.status !== 'finalized' && p.status !== 'completed') || perfList[0];
        setCurrentPerformance(active);
        if (active?.goals) {
          setSelfReviewRatings(active.goals.map((g) => ({ selfRating: g.selfRating || "" })));
        }
      } catch (err) {
        console.error('Error fetching my performance:', err);
        setError('Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPerformance();
  }, []);

  const handleSelfRatingChange = (index, rating) => {
    setSelfReviewRatings((prev) => {
      const next = [...prev];
      next[index] = { selfRating: Number(rating) };
      return next;
    });
  };

  const handleSubmitSelfReview = async () => {
    if (!currentPerformance?._id) return;
    const goals = selfReviewRatings.map((r) => ({ selfRating: Number(r.selfRating) || 0 }));
    if (goals.some((g) => !g.selfRating || g.selfRating < 1 || g.selfRating > 5)) {
      setReviewError("Please rate all goals (1-5)");
      return;
    }
    setReviewError("");
    setIsSubmittingReview(true);
    try {
      await submitSelfReview(currentPerformance._id, { goals });
      const response = await getMyPerformance();
      const perfList = response?.perf || [];
      setMyPerformance(perfList);
      const updated = perfList.find((p) => p._id === currentPerformance._id);
      setCurrentPerformance(updated);
      if (updated?.goals) {
        setSelfReviewRatings(updated.goals.map((g) => ({ selfRating: g.selfRating || "" })));
      }
      alert("Self-review submitted successfully!");
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || "Failed to submit self-review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const goals = currentPerformance?.goals || [];
  const performanceHistory = myPerformance.filter((p) => p.status === 'finalized' || p.status === 'completed').reverse();
  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + ((g.selfRating || 0) * (g.weightage || 0) / 5 / 100), 0) * 100)
    : 0;
  const completedGoals = goals.filter((g) => g.selfRating && g.selfRating >= 4).length;

  const tabs = [
    { id: "goals", label: "My Goals", icon: "🎯" },
    { id: "review", label: "Self Review", icon: "📝" },
    { id: "history", label: "History", icon: "📊" },
  ];

  const getRatingColor = (score) => {
    if (score >= 4.5) return "#16a34a";
    if (score >= 3.5) return "#2563eb";
    if (score >= 2.5) return "#ea580c";
    return "#dc2626";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Performance & Growth</h1>
          <p style={{ color: textSecondary }}>Track your goals, submit reviews, and view feedback</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
        <div className="p-5" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: textSecondary }} className="text-sm">Overall Progress</p>
              <p className="text-3xl font-bold" style={{ color: navyBlue }}>{overallProgress}%</p>
            </div>
            <DonutChart percentage={overallProgress} size={60} strokeWidth={8} color={navyBlue} />
          </div>
        </div>
        <div className="p-5" style={cardStyle}>
          <p style={{ color: textSecondary }} className="text-sm">Total Goals</p>
          <p className="text-3xl font-bold" style={{ color: textPrimary }}>{goals.length}</p>
        </div>
        <div className="p-5" style={cardStyle}>
          <p style={{ color: textSecondary }} className="text-sm">Completed</p>
          <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{completedGoals}</p>
        </div>
        <div className="p-5" style={cardStyle}>
          <p style={{ color: textSecondary }} className="text-sm">Last Rating</p>
          <p className="text-3xl font-bold" style={{ color: getRatingColor(performanceHistory[0]?.overallRating || 0) }}>
            {performanceHistory[0]?.overallRating?.toFixed(1) || "—"}/5
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl animate-fade-in-up" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
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
      {!isLoading && !error && activeTab === "goals" && (
        <div className="space-y-4 animate-fade-in-up">
          {goals.length === 0 ? (
            <div className="p-12 text-center" style={cardStyle}>
              <span className="text-4xl block mb-2">🎯</span>
              <p style={{ color: textSecondary }}>No goals assigned yet</p>
            </div>
          ) : (
            goals.map((goal, i) => {
              const progress = goal.selfRating ? Math.round((goal.selfRating / 5) * 100) : 0;
              return (
                <div 
                  key={goal._id || i} 
                  className="p-5 transition-all hover:scale-[1.01]"
                  style={{ ...cardStyle, animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{goal.title}</h3>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: goal.selfRating ? "#dcfce7" : "#fef3c7",
                            color: goal.selfRating ? "#16a34a" : "#d97706"
                          }}
                        >
                          {goal.selfRating ? `✓ Rated ${goal.selfRating}/5` : "Pending Review"}
                        </span>
                      </div>
                      <p style={{ color: textSecondary }}>{goal.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: textSecondary }}>
                        <span>⚖️ Weight: {goal.weightage}%</span>
                        {goal.selfRating && <span>⭐ Self Rating: {goal.selfRating}/5</span>}
                        {goal.managerRating && <span>👔 Manager Rating: {goal.managerRating}/5</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <DonutChart percentage={progress} size={80} strokeWidth={10} color={progress === 100 ? "#16a34a" : navyBlue} />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span style={{ color: textSecondary }}>Progress</span>
                      <span className="font-medium" style={{ color: textPrimary }}>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? "#16a34a" : navyBlue
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Self Review Tab */}
      {!isLoading && !error && activeTab === "review" && (
        <div className="p-6 animate-fade-in-up" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                {currentPerformance?.cycleId?.name || 'Self Review'}
              </h2>
              <p style={{ color: textSecondary }}>
                {currentPerformance?.cycleId?.stages?.selfReview
                  ? `Due by ${new Date(currentPerformance.cycleId.stages.selfReview).toLocaleDateString()}`
                  : 'Rate your performance for each goal'}
              </p>
            </div>
            <span 
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: goals.some(g => g.selfRating) ? "#dcfce7" : "#fef3c7", color: goals.some(g => g.selfRating) ? "#16a34a" : "#d97706" }}
            >
              {goals.some(g => g.selfRating) ? "✓ Submitted" : "⏳ Pending Submission"}
            </span>
          </div>

          {reviewError && (
            <div className="p-3 mb-4 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>{reviewError}</div>
          )}

          {goals.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl block mb-2">📝</span>
              <p style={{ color: textSecondary }}>No goals assigned for review</p>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal, idx) => (
                <div key={goal._id || idx} className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}>
                  <h3 className="font-semibold mb-2" style={{ color: textPrimary }}>{goal.title}</h3>
                  <p className="text-sm mb-4" style={{ color: textSecondary }}>{goal.description}</p>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium" style={{ color: textPrimary }}>Rate your performance (1-5):</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => handleSelfRatingChange(idx, n)}
                          className="w-12 h-12 rounded-xl font-bold transition-all"
                          style={{
                            backgroundColor: selfReviewRatings[idx]?.selfRating === n ? navyBlue : (isDark ? '#1e293b' : '#ffffff'),
                            color: selfReviewRatings[idx]?.selfRating === n ? '#ffffff' : textPrimary,
                            border: `2px solid ${selfReviewRatings[idx]?.selfRating === n ? navyBlue : (isDark ? '#475569' : '#e2e8f0')}`
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {selfReviewRatings[idx]?.selfRating && (
                      <span className="text-sm font-semibold" style={{ color: getRatingColor(selfReviewRatings[idx].selfRating) }}>
                        {selfReviewRatings[idx].selfRating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitSelfReview}
                disabled={isSubmittingReview}
                className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: navyBlue }}
              >
                {isSubmittingReview ? 'Submitting...' : '📤 Submit Self Review'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {!isLoading && !error && activeTab === "history" && (
        <div className="space-y-4 animate-fade-in-up">
          {performanceHistory.length === 0 ? (
            <div className="p-12 text-center" style={cardStyle}>
              <span className="text-4xl block mb-2">📊</span>
              <p style={{ color: textSecondary }}>No performance history yet</p>
            </div>
          ) : (
            performanceHistory.map((review, i) => {
              const cycleName = typeof review.cycleId === 'object' && review.cycleId?.name ? review.cycleId.name : 'Performance Review';
              const reviewerName = typeof review.reviewerId === 'object' && review.reviewerId?.name ? review.reviewerId.name : 'Manager';
              const overallRating = review.overallRating || 0;
              const feedback = review.goals?.find(g => g.comments)?.comments || 'No feedback provided';
              const ratingLabel = overallRating >= 4.5 ? 'Exceeds Expectations' : overallRating >= 3.5 ? 'Meets Expectations' : overallRating >= 2.5 ? 'Needs Improvement' : 'Below Expectations';
              return (
                <div key={review._id || i} className="p-6" style={cardStyle}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{cycleName}</h3>
                      <p style={{ color: textSecondary }}>Reviewed by {reviewerName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: getRatingColor(overallRating) }}>{overallRating.toFixed(1)}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>out of 5</p>
                      </div>
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${getRatingColor(overallRating)}20`, color: getRatingColor(overallRating) }}
                      >
                        {ratingLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: textSecondary }}>Manager Feedback</p>
                    <p style={{ color: textPrimary }}>"{feedback}"</p>
                  </div>
                  {review.goals && review.goals.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                      <p className="text-sm font-medium mb-2" style={{ color: textSecondary }}>Goal Ratings:</p>
                      <div className="space-y-2">
                        {review.goals.map((goal, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span style={{ color: textPrimary }}>{goal.title}</span>
                            <div className="flex items-center gap-2">
                              {goal.selfRating && <span style={{ color: textSecondary }}>Self: {goal.selfRating}/5</span>}
                              {goal.managerRating && <span style={{ color: textSecondary }}>Manager: {goal.managerRating}/5</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
