import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import DonutChart from "../../components/charts/DonutChart";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";

// Employee Stats
const employeeStats = [
  { label: "Pending Tasks", value: 3, color: "#2563eb", icon: "📋", change: "+2" },
  { label: "Leave Balance", value: 12, color: "#16a34a", icon: "🏖️", change: "days" },
  { label: "Attendance", value: "95%", color: "#7c3aed", icon: "⏰", change: "this month" },
  { label: "Open Grievances", value: 1, color: "#ea580c", icon: "📝", change: "pending" },
];

// HR/Manager Stats
const hrStats = [
  { label: "Total Employees", value: 156, color: "#2563eb", icon: "👥", change: "+5 this month" },
  { label: "Pending Approvals", value: 8, color: "#ea580c", icon: "✅", change: "need action" },
  { label: "New Hires", value: 5, color: "#16a34a", icon: "🎉", change: "this month" },
  { label: "Open Grievances", value: 3, color: "#dc2626", icon: "📝", change: "unresolved" },
];

// Chart Data for HR
const departmentData = [
  { label: "Eng", value: 45, color: "#2563eb" },
  { label: "Sales", value: 25, color: "#16a34a" },
  { label: "HR", value: 12, color: "#7c3aed" },
  { label: "Finance", value: 18, color: "#ea580c" },
  { label: "Ops", value: 20, color: "#0891b2" },
];

const monthlyAttendance = [
  { label: "Mon", value: 95 },
  { label: "Tue", value: 98 },
  { label: "Wed", value: 92 },
  { label: "Thu", value: 96 },
  { label: "Fri", value: 88 },
];

const recentActivities = [
  { id: 1, action: "Checked in", time: "Today, 9:00 AM", icon: "🟢", type: "success" },
  { id: 2, action: "Leave request submitted", time: "Yesterday, 3:30 PM", icon: "📅", type: "info" },
  { id: 3, action: "Profile updated", time: "Dec 10, 2024", icon: "✏️", type: "default" },
  { id: 4, action: "Task completed", time: "Dec 8, 2024", icon: "✅", type: "success" },
];

const upcomingEvents = [
  { id: 1, title: "Team Meeting", date: "Dec 13", time: "10:00 AM", type: "meeting" },
  { id: 2, title: "Performance Review", date: "Dec 15", time: "2:00 PM", type: "review" },
  { id: 3, title: "Christmas Party", date: "Dec 25", time: "6:00 PM", type: "holiday" },
];

const teamMembers = [
  { id: 1, name: "Priya Sharma", role: "Senior Developer", avatar: "P", status: "online" },
  { id: 2, name: "Rahul Verma", role: "UI Designer", avatar: "R", status: "online" },
  { id: 3, name: "Anita Patel", role: "QA Engineer", avatar: "A", status: "away" },
  { id: 4, name: "Vikram Singh", role: "DevOps", avatar: "V", status: "offline" },
];

// Quick Links for Employee (without Directory)
const employeeQuickLinks = [
  { name: "Apply Leave", path: "/leave", icon: "🏖️", color: "#16a34a" },
  { name: "Grievance", path: "/grievance", icon: "📝", color: "#ea580c" },
  { name: "Attendance", path: "/attendance", icon: "⏰", color: "#7c3aed" },
  { name: "Events", path: "/events", icon: "🎉", color: "#2563eb" },
];

// Quick Links for HR (with Directory)
const hrQuickLinks = [
  { name: "Approvals", path: "/hr/approvals", icon: "✅", color: "#16a34a" },
  { name: "Directory", path: "/directory", icon: "👥", color: "#2563eb" },
  { name: "Reports", path: "/hr/reports", icon: "📑", color: "#ea580c" },
  { name: "Settings", path: "/hr/settings", icon: "⚙️", color: "#7c3aed" },
];

// Quick Links for Admin
const adminQuickLinks = [
  { name: "User Mgmt", path: "/hr/users", icon: "👥", color: "#dc2626" },
  { name: "Approvals", path: "/hr/approvals", icon: "✅", color: "#16a34a" },
  { name: "Reports", path: "/hr/reports", icon: "📑", color: "#2563eb" },
  { name: "Settings", path: "/hr/settings", icon: "🔧", color: "#7c3aed" },
];

// Admin Stats
const adminStats = [
  { label: "Total Users", value: 156, color: "#2563eb", icon: "👥", change: "all employees" },
  { label: "Pending Verification", value: 5, color: "#ea580c", icon: "🔍", change: "need review" },
  { label: "Active Sessions", value: 42, color: "#16a34a", icon: "🟢", change: "online now" },
  { label: "System Health", value: "99%", color: "#7c3aed", icon: "⚡", change: "uptime" },
];

// Weekly Motivational Quotes (changes every Monday)
const weeklyQuotes = [
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { quote: "Great things never come from comfort zones.", author: "Unknown" },
  { quote: "Dream it. Wish it. Do it.", author: "Unknown" },
  { quote: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { quote: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { quote: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { quote: "Little things make big days.", author: "Unknown" },
  { quote: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { quote: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { quote: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { quote: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
];

// Get quote index based on the week number of the year
const getWeeklyQuoteIndex = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return weekNumber % weeklyQuotes.length;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isHRManager = user?.role === "hr_manager";
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";
  
  // Get appropriate stats and quick links based on role
  const currentStats = isAdmin ? adminStats : (isHRManager ? hrStats : employeeStats);
  const quickLinks = isAdmin ? adminQuickLinks : (isHRManager ? hrQuickLinks : employeeQuickLinks);

  // Get current week's quote
  const currentQuote = weeklyQuotes[getWeeklyQuoteIndex()];

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
      {/* Welcome Header */}
      <div 
        className="rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden animate-fade-in-up"
        style={{ background: isAdmin ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)' : colors.gradient }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back, {user.name}! 👋</h1>
            <p className={`text-sm sm:text-lg ${isAdmin ? "text-red-100" : "text-blue-100"}`}>
              {isAdmin
                ? "System administration overview"
                : isHRManager
                ? "Here's your organization overview for today"
                : "Here's what's happening with your work today"}
            </p>
          </div>
          <div className="hidden md:block animate-float">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl sm:text-5xl">
              {isAdmin ? "🛡️" : isHRManager ? "👔" : "👤"}
            </div>
          </div>
        </div>
      </div>

      {/* Quote of the Week - Employee Only (not for Admin or HR) */}
      {isEmployee && (
        <div 
          className="p-6 rounded-2xl animate-fade-in-up relative overflow-hidden"
          style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`
          }}
        >
          {/* Decorative Quote Icon */}
          <div 
            className="absolute top-4 left-4 text-6xl opacity-10"
            style={{ color: colors.primary }}
          >
            ❝
          </div>
          <div className="relative z-10 pl-8">
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
              >
                💡 Quote of the Week
              </span>
            </div>
            <p 
              className="text-xl font-medium italic mb-3 leading-relaxed"
              style={{ color: textPrimary }}
            >
              "{currentQuote.quote}"
            </p>
            <p 
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              — {currentQuote.author}
            </p>
          </div>
          {/* Decorative Element */}
          <div 
            className="absolute bottom-4 right-4 text-6xl opacity-10"
            style={{ color: colors.primary }}
          >
            ❞
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentStats.map((stat, index) => (
          <div 
            key={index} 
            className="p-5 hover-lift animate-fade-in-up"
            style={{ ...cardStyle, animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.change}</p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl animate-pulse-slow"
                style={{ 
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                  boxShadow: `0 4px 15px ${stat.color}20`
                }}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - HR and Admin */}
      {(isHRManager || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-2">
          {/* Department Distribution */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Department Distribution
            </h3>
            <div className="flex items-center justify-center">
              <PieChart data={departmentData} size={180} strokeWidth={35} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {departmentData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs" style={{ color: textSecondary }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Today's Attendance
            </h3>
            <div className="flex items-center justify-center mb-4">
              <DonutChart 
                percentage={91} 
                size={150} 
                strokeWidth={15} 
                color="#16a34a" 
                label="Present"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Present", value: 142, color: "#16a34a" },
                { label: "Leave", value: 8, color: "#ea580c" },
                { label: "Absent", value: 6, color: "#dc2626" },
              ].map((item, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                  <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs" style={{ color: textSecondary }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Attendance Trend */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Weekly Attendance %
            </h3>
            <BarChart data={monthlyAttendance} height={180} />
          </div>
        </div>
      )}

      {/* Employee Chart Section - Employee Only (not for Admin) */}
      {isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-2">
          {/* My Attendance */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              My Attendance This Month
            </h3>
            <div className="flex items-center justify-around">
              <DonutChart 
                percentage={95} 
                size={140} 
                strokeWidth={14} 
                color="#16a34a" 
                label="Present"
              />
              <div className="space-y-3">
                {[
                  { label: "Present", value: 19, color: "#16a34a" },
                  { label: "Leave", value: 1, color: "#ea580c" },
                  { label: "Working Days", value: 22, color: "#2563eb" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm" style={{ color: textSecondary }}>{item.label}:</span>
                    <span className="font-bold" style={{ color: textPrimary }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Progress */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Task Progress
            </h3>
            <div className="space-y-4">
              {[
                { label: "Completed", value: 8, total: 10, color: "#16a34a" },
                { label: "In Progress", value: 2, total: 10, color: "#2563eb" },
                { label: "Pending Review", value: 1, total: 10, color: "#ea580c" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: textPrimary }}>{item.label}</span>
                    <span className="text-sm" style={{ color: textSecondary }}>{item.value}/{item.total}</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(item.value / item.total) * 100}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}50`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - For Employee and HR */}
        {!isAdmin && (
          <div className="lg:col-span-2 p-6 animate-fade-in-up stagger-3" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f8fafc',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ 
                      background: activity.type === 'success' 
                        ? 'linear-gradient(135deg, #16a34a20, #16a34a10)'
                        : activity.type === 'info'
                        ? 'linear-gradient(135deg, #2563eb20, #2563eb10)'
                        : `linear-gradient(135deg, ${isDark ? '#475569' : '#e2e8f0'}, ${isDark ? '#334155' : '#f1f5f9'})`
                    }}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: textPrimary }}>{activity.action}</p>
                    <p className="text-sm" style={{ color: textSecondary }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin System Overview */}
        {isAdmin && (
          <div className="lg:col-span-2 p-6 animate-fade-in-up stagger-3" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>System Overview</h2>
            <div className="space-y-4">
              {[
                { label: "User Registrations (This Month)", value: 12, icon: "👤", color: "#2563eb" },
                { label: "Pending Approvals", value: 8, icon: "⏳", color: "#ea580c" },
                { label: "Documents to Verify", value: 5, icon: "📄", color: "#7c3aed" },
                { label: "BGV In Progress", value: 3, icon: "🔍", color: "#16a34a" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${item.color}20` }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: textPrimary }}>{item.label}</p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links - For Employee and HR only (not Admin) */}
        {!isAdmin && (
          <div className="p-6 animate-fade-in-up stagger-4" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="p-4 rounded-xl text-center transition-all hover-lift hover-glow"
                  style={{ 
                    background: `linear-gradient(135deg, ${link.color}15, ${link.color}05)`,
                    border: `1px solid ${link.color}30`
                  }}
                >
                  <span className="text-3xl block mb-2">{link.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: link.color }}>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Admin Quick Access */}
        {isAdmin && (
          <div className="p-6 animate-fade-in-up stagger-4" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Admin Quick Access</h2>
            <div className="space-y-3">
              {adminQuickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f8fafc',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${link.color}20` }}>
                    {link.icon}
                  </div>
                  <span className="font-semibold" style={{ color: textPrimary }}>{link.name}</span>
                  <span className="ml-auto" style={{ color: textSecondary }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row - For Employee and HR only */}
      {!isAdmin && (
        <div className={`grid grid-cols-1 ${isHRManager ? 'lg:grid-cols-2' : ''} gap-6`}>
          {/* Upcoming Events */}
          <div className="p-6 animate-fade-in-up stagger-5" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Upcoming Events</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f8fafc',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white text-sm font-bold"
                    style={{ 
                      background: event.type === "meeting" 
                        ? "linear-gradient(135deg, #2563eb, #1e3a5f)" 
                        : event.type === "review" 
                        ? "linear-gradient(135deg, #7c3aed, #5b21b6)" 
                        : "linear-gradient(135deg, #16a34a, #15803d)"
                    }}
                  >
                    <span className="text-lg">{event.date.split(" ")[1]}</span>
                    <span className="text-[10px] opacity-80">{event.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: textPrimary }}>{event.title}</p>
                    <p className="text-sm" style={{ color: textSecondary }}>{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members - HR Only */}
          {isHRManager && (
            <div className="p-6 animate-fade-in-up stagger-5" style={cardStyle}>
              <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Team Members</h2>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}
                  >
                    <div className="relative">
                      <div 
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
                      >
                        {member.avatar}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ 
                          borderColor: isDark ? '#1e293b' : '#ffffff',
                          backgroundColor: member.status === "online" ? "#16a34a" : member.status === "away" ? "#eab308" : "#94a3b8"
                        }}
                      ></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: textPrimary }}>{member.name}</p>
                      <p className="text-sm" style={{ color: textSecondary }}>{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/directory"
                className="mt-4 block text-center font-semibold text-sm py-3 rounded-xl transition-all hover:opacity-80"
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: '#ffffff'
                }}
              >
                View All Employees →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
