import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DonutChart from "../../components/charts/DonutChart";

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({});

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const overallProgress = Math.round(mockGoals.reduce((sum, g) => sum + (g.progress * g.weight / 100), 0));
  const completedGoals = mockGoals.filter(g => g.status === "completed").length;

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
          <p className="text-3xl font-bold" style={{ color: textPrimary }}>{mockGoals.length}</p>
        </div>
        <div className="p-5" style={cardStyle}>
          <p style={{ color: textSecondary }} className="text-sm">Completed</p>
          <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{completedGoals}</p>
        </div>
        <div className="p-5" style={cardStyle}>
          <p style={{ color: textSecondary }} className="text-sm">Last Rating</p>
          <p className="text-3xl font-bold" style={{ color: getRatingColor(performanceHistory[0]?.score) }}>
            {performanceHistory[0]?.score}/5
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

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <div className="space-y-4 animate-fade-in-up">
          {mockGoals.map((goal, i) => (
            <div 
              key={goal.id} 
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
                        backgroundColor: goal.status === "completed" ? "#dcfce7" : "#fef3c7",
                        color: goal.status === "completed" ? "#16a34a" : "#d97706"
                      }}
                    >
                      {goal.status === "completed" ? "✓ Completed" : "In Progress"}
                    </span>
                  </div>
                  <p style={{ color: textSecondary }}>{goal.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: textSecondary }}>
                    <span>📅 Due: {goal.deadline}</span>
                    <span>⚖️ Weight: {goal.weight}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <DonutChart percentage={goal.progress} size={80} strokeWidth={10} color={goal.progress === 100 ? "#16a34a" : navyBlue} />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span style={{ color: textSecondary }}>Progress</span>
                  <span className="font-medium" style={{ color: textPrimary }}>{goal.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${goal.progress}%`,
                      backgroundColor: goal.progress === 100 ? "#16a34a" : navyBlue
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Self Review Tab */}
      {activeTab === "review" && (
        <div className="p-6 animate-fade-in-up" style={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Q4 2024 Self Review</h2>
              <p style={{ color: textSecondary }}>Due by December 31, 2024</p>
            </div>
            <span 
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
            >
              ⏳ Pending Submission
            </span>
          </div>

          <div className="space-y-6">
            {selfReviewQuestions.map((q) => (
              <div key={q.id}>
                <label className="block font-medium mb-2" style={{ color: textPrimary }}>{q.question}</label>
                {q.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={reviewForm[q.id] || ""}
                    onChange={(e) => setReviewForm({ ...reviewForm, [q.id]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="Enter your response..."
                  />
                ) : (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setReviewForm({ ...reviewForm, [q.id]: n })}
                        className="w-12 h-12 rounded-xl font-bold transition-all"
                        style={{
                          backgroundColor: reviewForm[q.id] === n ? navyBlue : (isDark ? '#334155' : '#f8fafc'),
                          color: reviewForm[q.id] === n ? '#ffffff' : textPrimary,
                          border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* File Upload */}
            <div>
              <label className="block font-medium mb-2" style={{ color: textPrimary }}>Supporting Evidence (Optional)</label>
              <label 
                className="flex items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-all hover:opacity-80"
                style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `2px dashed ${isDark ? '#475569' : '#e2e8f0'}` }}
              >
                <span className="text-2xl">📎</span>
                <span style={{ color: textSecondary }}>Click to upload files (documents, screenshots, etc.)</span>
                <input type="file" className="hidden" multiple />
              </label>
            </div>

            <button
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: navyBlue }}
            >
              📤 Submit Self Review
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-fade-in-up">
          {performanceHistory.map((review, i) => (
            <div key={i} className="p-6" style={cardStyle}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{review.period}</h3>
                  <p style={{ color: textSecondary }}>Reviewed by {review.reviewedBy}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: getRatingColor(review.score) }}>{review.score}</p>
                    <p className="text-xs" style={{ color: textSecondary }}>out of 5</p>
                  </div>
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${getRatingColor(review.score)}20`, color: getRatingColor(review.score) }}
                  >
                    {review.rating}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <p className="text-sm font-medium mb-1" style={{ color: textSecondary }}>Manager Feedback</p>
                <p style={{ color: textPrimary }}>"{review.feedback}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
