import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import DonutChart from "../../components/charts/DonutChart";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";

const reportTypes = [
  { id: "attendance", name: "Attendance Report", icon: "⏰", desc: "Daily, weekly, monthly attendance data", color: "#2563eb" },
  { id: "leave", name: "Leave Report", icon: "🏖️", desc: "Leave balances and usage", color: "#16a34a" },
  { id: "onboarding", name: "Onboarding Report", icon: "📋", desc: "New joiner status and progress", color: "#7c3aed" },
  { id: "performance", name: "Performance Report", icon: "📊", desc: "Goals and review scores", color: "#ea580c" },
  { id: "grievance", name: "Grievance Report", icon: "📝", desc: "Complaint status and resolution", color: "#dc2626" },
  { id: "asset", name: "Asset Report", icon: "💻", desc: "Asset allocation and inventory", color: "#0891b2" },
];

const departmentAttendance = [
  { label: "Eng", value: 85, color: "#2563eb" },
  { label: "Sales", value: 72, color: "#16a34a" },
  { label: "HR", value: 95, color: "#7c3aed" },
  { label: "Finance", value: 68, color: "#ea580c" },
  { label: "QA", value: 78, color: "#0891b2" },
];

const leaveDistribution = [
  { value: 45, color: "#dc2626" },  // Used
  { value: 8, color: "#ea580c" },   // Pending
  { value: 67, color: "#16a34a" },  // Available
];

const mockOnboardingData = [
  { status: "Pending Manager Approval", count: 2, color: "#d97706" },
  { status: "Documents Pending", count: 3, color: "#2563eb" },
  { status: "BGV In Progress", count: 1, color: "#7c3aed" },
  { status: "Onboarded This Month", count: 5, color: "#16a34a" },
];

export default function Reports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedReport, setSelectedReport] = useState("attendance");
  const [dateRange, setDateRange] = useState("this_month");

  const colors = {
    primary: '#1e3a5f',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
  };

  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '20px',
    boxShadow: isDark ? 'none' : '0 4px 20px rgba(30, 58, 95, 0.08)',
  };

  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Reports</h1>
          <p style={{ color: textSecondary }}>Generate and view various HR reports</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl font-medium outline-none"
            style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
          <button 
            className="px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2"
            style={{ background: colors.gradient, boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up">
        {reportTypes.map((report, index) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className="p-4 cursor-pointer transition-all hover-lift"
            style={{
              ...cardStyle,
              borderColor: selectedReport === report.id ? report.color : (isDark ? '#334155' : '#e2e8f0'),
              borderWidth: selectedReport === report.id ? '2px' : '1px',
              background: selectedReport === report.id 
                ? `linear-gradient(135deg, ${report.color}10, ${report.color}05)`
                : (isDark ? '#1e293b' : '#ffffff'),
              animationDelay: `${index * 0.05}s`
            }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ background: `linear-gradient(135deg, ${report.color}30, ${report.color}10)` }}
            >
              {report.icon}
            </div>
            <h3 className="font-bold text-sm" style={{ color: textPrimary }}>{report.name}</h3>
            <p className="text-xs mt-1" style={{ color: textSecondary }}>{report.desc}</p>
          </div>
        ))}
      </div>

      {/* Attendance Report */}
      {selectedReport === "attendance" && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Employees", value: 63, color: "#2563eb", icon: "👥" },
              { label: "Present Today", value: 56, color: "#16a34a", icon: "✅" },
              { label: "Absent", value: 4, color: "#dc2626", icon: "❌" },
              { label: "On Leave", value: 3, color: "#ea580c", icon: "🏖️" },
            ].map((stat, i) => (
              <div key={i} className="p-5 hover-lift" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: textSecondary }} className="text-sm">{stat.label}</p>
                    <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)` }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Donut */}
            <div className="p-6" style={cardStyle}>
              <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Overall Attendance Rate</h3>
              <div className="flex items-center justify-around">
                <DonutChart percentage={89} size={180} strokeWidth={18} color="#16a34a" label="Present" />
                <div className="space-y-4">
                  {[
                    { label: "Present", value: 56, color: "#16a34a" },
                    { label: "On Leave", value: 3, color: "#ea580c" },
                    { label: "Absent", value: 4, color: "#dc2626" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span style={{ color: textSecondary }}>{item.label}:</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Attendance */}
            <div className="p-6" style={cardStyle}>
              <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Department-wise Attendance %</h3>
              <BarChart data={departmentAttendance} height={200} />
            </div>
          </div>
        </div>
      )}

      {/* Leave Report */}
      {selectedReport === "leave" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          {/* Leave Distribution Chart */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Leave Distribution</h3>
            <div className="flex items-center justify-around">
              <PieChart data={leaveDistribution} size={200} strokeWidth={40} />
              <div className="space-y-4">
                {[
                  { label: "Used", value: 45, color: "#dc2626" },
                  { label: "Pending", value: 8, color: "#ea580c" },
                  { label: "Available", value: 67, color: "#16a34a" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span style={{ color: textSecondary }}>{item.label}:</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leave by Type */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Leave by Type</h3>
            <div className="space-y-4">
              {[
                { type: "Casual Leave", used: 45, total: 120, color: "#2563eb" },
                { type: "Sick Leave", used: 22, total: 80, color: "#dc2626" },
                { type: "Earned Leave", used: 30, total: 150, color: "#16a34a" },
                { type: "Work From Home", used: 85, total: 200, color: "#7c3aed" },
              ].map((leave, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium" style={{ color: textPrimary }}>{leave.type}</span>
                    <span style={{ color: textSecondary }}>{leave.used} / {leave.total}</span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <div 
                      className="h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(leave.used / leave.total) * 100}%`,
                        background: `linear-gradient(90deg, ${leave.color}, ${leave.color}80)`,
                        boxShadow: `0 0 10px ${leave.color}40`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Report */}
      {selectedReport === "onboarding" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Onboarding Pipeline</h3>
            <div className="space-y-4">
              {mockOnboardingData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <span style={{ color: textSecondary }}>{item.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full" style={{ backgroundColor: isDark ? '#475569' : '#e2e8f0' }}>
                      <div className="h-2 rounded-full" style={{ width: `${(item.count / 10) * 100}%`, backgroundColor: item.color }}></div>
                    </div>
                    <span className="font-bold w-8 text-right" style={{ color: item.color }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>Onboarding Funnel</h3>
            <div className="flex items-center justify-center">
              <DonutChart percentage={78} size={180} strokeWidth={18} color="#7c3aed" label="Completion" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {[
                { label: "Total Pipeline", value: 11, color: "#2563eb" },
                { label: "Completed", value: 5, color: "#16a34a" },
                { label: "In Progress", value: 4, color: "#ea580c" },
                { label: "Pending", value: 2, color: "#d97706" },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs" style={{ color: textSecondary }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Reports Placeholder */}
      {["performance", "grievance", "asset"].includes(selectedReport) && (
        <div className="p-12 text-center animate-fade-in-up" style={cardStyle}>
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: colors.gradient }}
          >
            <span className="text-5xl">{reportTypes.find(r => r.id === selectedReport)?.icon}</span>
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>
            {reportTypes.find(r => r.id === selectedReport)?.name}
          </h3>
          <p className="mb-6" style={{ color: textSecondary }}>
            Select date range and click Export to generate the report
          </p>
          <button 
            className="px-8 py-3 rounded-xl font-bold text-white"
            style={{ background: colors.gradient, boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}
