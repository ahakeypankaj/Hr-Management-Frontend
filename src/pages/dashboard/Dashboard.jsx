import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import DonutChart from "../../components/charts/DonutChart";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";
import { fetchDashboardData } from "../../services/dashboardService";
import { getAttendanceDashboard } from "../../services/attendanceService";
import { fetchEmployeeEOD, fetchEODDetails } from "../../services/eodService";
import { fetchEmployees } from "../../services/directoryService";
import { getQuotes } from "../../services/quoteService";
import { fetchEvents } from "../../services/eventService";
import { getRecentActivity } from "../../services/activityService";

// Employee Stats
const getEmployeeStats = (user, eodStatus = null) => {
  const stats = [
    { label: "Pending Tasks", value: 3, color: "#2563eb", icon: "📋", change: "+2" },
    { label: "Leave Balance", value: 12, color: "#16a34a", icon: "🏖️", change: "days" },
    { label: "Attendance", value: "95%", color: "#7c3aed", icon: "⏰", change: "this month" },
    { label: "Open Grievances", value: 1, color: "#ea580c", icon: "📝", change: "pending" },
  ];

  // Add Today's EOD Track box
  const eodStatusValue = eodStatus === 'submitted' ? 'Submitted' : 'Pending';
  const eodStatusColor = eodStatus === 'submitted' ? '#16a34a' : '#ea580c';
  const eodStatusChange = eodStatus === 'submitted' ? 'completed' : 'not submitted';
  const eodDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  stats.push({
    label: "Today's EOD Track",
    value: eodStatusValue,
    color: eodStatusColor,
    icon: "📝",
    change: eodStatusChange,
    date: eodDate
  });

  // Add View Calendar box
  stats.push({
    label: "View Calendar",
    value: "📅",
    color: "#0891b2",
    icon: "📅",
    change: "attendance",
    isClickable: true
  });

  return stats;
};

// Default HR/Manager Stats (fallback)
const defaultHrStats = [
  { label: "Total Employees", value: 0, color: "#2563eb", icon: "👥", change: "loading..." },
  { label: "Pending Approvals", value: 0, color: "#ea580c", icon: "✅", change: "need action" },
  { label: "New Hires", value: 0, color: "#16a34a", icon: "🎉", change: "this month" },
  { label: "Open Grievances", value: 0, color: "#dc2626", icon: "📝", change: "unresolved" },
];

// Default Admin Stats (fallback)
const defaultAdminStats = [
  { label: "Total Users", value: 0, color: "#2563eb", icon: "👥", change: "loading..." },
  { label: "Pending Approvals", value: 0, color: "#ea580c", icon: "✅", change: "need action" },
  { label: "New Hires", value: 0, color: "#16a34a", icon: "🎉", change: "this month" },
  { label: "Open Grievances", value: 0, color: "#dc2626", icon: "📝", change: "unresolved" },
];

// Default Chart Data for HR (fallback)
const defaultDepartmentData = [
  { label: "IT", value: 0, color: "#2563eb" },
  { label: "Engineering", value: 0, color: "#16a34a" },
  { label: "HR", value: 0, color: "#7c3aed" },
  { label: "QA", value: 0, color: "#ea580c" },
];

const defaultWeeklyAttendance = [
  { label: "Mon", value: 0 },
  { label: "Tue", value: 0 },
  { label: "Wed", value: 0 },
  { label: "Thu", value: 0 },
  { label: "Fri", value: 0 },
];

const recentActivities = [
  { id: 1, action: "Checked in", time: "Today, 9:00 AM", icon: "🟢", type: "success" },
  { id: 2, action: "Leave request submitted", time: "Yesterday, 3:30 PM", icon: "📅", type: "info" },
  { id: 3, action: "Profile updated", time: "Dec 10, 2024", icon: "✏️", type: "default" },
  { id: 4, action: "Task completed", time: "Dec 8, 2024", icon: "✅", type: "success" },
];

// Get personalized activities based on user
const getPersonalizedActivities = (user) => {
  if (!user || !user.name) return recentActivities;
  
  return [
    { id: 1, action: "Checked in", time: "Today, 9:00 AM", icon: "🟢", type: "success" },
    { id: 2, action: `${user.name} submitted leave request`, time: "Yesterday, 3:30 PM", icon: "📅", type: "info" },
    { id: 3, action: "Profile updated", time: "Dec 10, 2024", icon: "✏️", type: "default" },
    { id: 4, action: `Task completed in ${user.department || 'department'}`, time: "Dec 8, 2024", icon: "✅", type: "success" },
  ];
};

const upcomingEvents = [
  { id: 1, title: "Daily Standup Meet", date: "Daily", time: "9:30 PM", type: "meeting" },
  { id: 2, title: "Irish Taylor Talk", date: "Wed", time: "5:30 PM", type: "meeting" },
  { id: 3, title: "Irish Taylor Talks", date: "Friday", time: "5:30 PM", type: "meeting" },
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
  { name: "Onboarding Employees", path: "/hr/users", icon: "👤", color: "#2563eb" },
  { name: "Attendance Management", path: "/hr/attendance", icon: "⏰", color: "#16a34a" },
  { name: "Directory", path: "/directory", icon: "👥", color: "#7c3aed" },
  { name: "Grievance", path: "/grievance", icon: "📝", color: "#ea580c" },
];

// Quick Links for Admin
const adminQuickLinks = [
  { name: "User Mgmt", path: "/hr/users", icon: "👥", color: "#dc2626" },
  { name: "Attendance Management", path: "/hr/attendance", icon: "⏰", color: "#16a34a" },
  { name: "Approvals", path: "/hr/approvals", icon: "✅", color: "#16a34a" },
  { name: "Settings", path: "/hr/settings", icon: "🔧", color: "#7c3aed" },
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
  
  // Dashboard API state (for HR/Admin only)
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  
  // Attendance Dashboard API state (for HR/Admin only)
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Today's EOD status (for Employee only)
  const [todayEODStatus, setTodayEODStatus] = useState(null);
  const [isLoadingEOD, setIsLoadingEOD] = useState(false);

  // Today's EOD summary (for HR/Admin only)
  const [todayEODSummary, setTodayEODSummary] = useState(null);
  const [isLoadingEODSummary, setIsLoadingEODSummary] = useState(false);

  // Team members from directory (for HR/Admin only)
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  // Calendar modal state (for Employee only)
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Quote state (for Employee only)
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  // Events state (for Employee and HR)
  const [upcomingEventsData, setUpcomingEventsData] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Recent Activity state (for HR and Admin)
  const [recentActivitiesData, setRecentActivitiesData] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Fetch dashboard data for HR/Admin
  useEffect(() => {
    if (isHRManager || isAdmin) {
      const loadDashboardData = async () => {
        setIsLoadingDashboard(true);
        setDashboardError(null);
        try {
          const data = await fetchDashboardData();
          setDashboardData(data);
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
          setDashboardError(error.message || 'Failed to load dashboard data');
        } finally {
          setIsLoadingDashboard(false);
        }
      };
      loadDashboardData();
    }
  }, [isHRManager, isAdmin]);

  // Fetch attendance dashboard data for HR/Admin
  useEffect(() => {
    if (isHRManager || isAdmin) {
      const loadAttendanceData = async () => {
        setIsLoadingAttendance(true);
        setAttendanceError(null);
        try {
          const data = await getAttendanceDashboard();
          setAttendanceData(data);
        } catch (error) {
          console.error('Failed to load attendance data:', error);
          setAttendanceError(error.message || 'Failed to load attendance data');
        } finally {
          setIsLoadingAttendance(false);
        }
      };
      loadAttendanceData();
    }
  }, [isHRManager, isAdmin]);

  // Fetch team members from directory API for HR/Admin
  useEffect(() => {
    if (isHRManager || isAdmin) {
      const loadTeamMembers = async () => {
        setIsLoadingTeamMembers(true);
        try {
          const data = await fetchEmployees();
          const employees = data.users || data.data || data || [];
          // Map employees to team member format
          const mappedMembers = employees.slice(0, 4).map((employee) => ({
            id: employee._id || employee.id,
            name: employee.name || "Unknown",
            role: employee.designation || employee.role || "Employee",
            department: employee.department?.name || employee.department || "",
            avatar: (employee.name || "U").charAt(0).toUpperCase(),
            profilePicture: employee.profilePicture || null,
            status: "online",
          }));
          setTeamMembersData(mappedMembers);
        } catch (error) {
          console.error('Failed to load team members:', error);
          setTeamMembersData([]);
        } finally {
          setIsLoadingTeamMembers(false);
        }
      };
      loadTeamMembers();
    }
  }, [isHRManager, isAdmin]);

  // Fetch today's EOD summary for HR/Admin
  useEffect(() => {
    if (isHRManager || isAdmin) {
      const loadTodayEODSummary = async () => {
        setIsLoadingEODSummary(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const data = await fetchEODDetails({
            startDate: today,
            endDate: today,
            page: 1,
            limit: 1
          });
          
          // Extract stats from API response (similar to EODManagement component)
          const stats = data.stats || data.summary || {};
          const submitted = stats.submittedToday || stats.submitted || stats.totalSubmitted || 0;
          const total = stats.totalEmployees || stats.total || 0;
          
          setTodayEODSummary({
            submitted: submitted,
            total: total
          });
        } catch (error) {
          console.error('Failed to load today\'s EOD summary:', error);
          setTodayEODSummary({ submitted: 0, total: 0 });
        } finally {
          setIsLoadingEODSummary(false);
        }
      };
      loadTodayEODSummary();
    }
  }, [isHRManager, isAdmin]);

  // Fetch today's EOD status for Employee
  useEffect(() => {
    if (isEmployee && user?.id) {
      const loadTodayEOD = async () => {
        setIsLoadingEOD(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const data = await fetchEmployeeEOD(user.id, today, today, 1, 1);
          const eods = data.eods || [];
          // Check if there's an EOD for today
          const todayEOD = eods.find(eod => {
            const eodDate = eod.date ? new Date(eod.date).toISOString().split('T')[0] : null;
            return eodDate === today;
          });
          setTodayEODStatus(todayEOD ? 'submitted' : 'pending');
        } catch (error) {
          console.error('Failed to load today\'s EOD status:', error);
          setTodayEODStatus('pending'); // Default to pending on error
        } finally {
          setIsLoadingEOD(false);
        }
      };
      loadTodayEOD();
    }
  }, [isEmployee, user?.id]);

  // Map API stats to UI format for HR
  const getHrStats = () => {
    const stats = [];
    
    if (dashboardData?.stats) {
      const { stats: apiStats } = dashboardData;
      stats.push(
        { label: "Total Employees", value: apiStats.totalEmployees || 0, color: "#2563eb", icon: "👥", change: "all employees" },
        { label: "Pending Approvals", value: apiStats.pendingApprovals || 0, color: "#ea580c", icon: "✅", change: "need action" },
        { label: "New Hires", value: apiStats.newHires || 0, color: "#16a34a", icon: "🎉", change: "this month" },
        { label: "Open Grievances", value: apiStats.openGrievances || 0, color: "#dc2626", icon: "📝", change: "unresolved" }
      );
    } else {
      stats.push(...defaultHrStats);
    }

    // Always add EOD Tracker box dynamically using fetched data
    const eodSubmitted = todayEODSummary?.submitted || 0;
    // Use total from EOD summary, or fallback to dashboardData totalEmployees if available
    const eodTotal = todayEODSummary?.total || dashboardData?.stats?.totalEmployees || 0;
    const eodValue = eodTotal > 0 ? `${eodSubmitted}/${eodTotal}` : '0/0';
    const eodColor = eodTotal > 0 && eodSubmitted === eodTotal ? '#16a34a' : '#ea580c';
    const eodChange = eodTotal > 0 ? `${Math.round((eodSubmitted / eodTotal) * 100)}% complete` : 'no data';
    const eodDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    stats.push({
      label: "EOD Tracker",
      value: eodValue,
      color: eodColor,
      icon: "📝",
      change: eodChange,
      date: eodDate
    });

    return stats;
  };

  // Map API stats to UI format for Admin (similar to HR but with admin-specific labels)
  const getAdminStats = () => {
    const stats = [];
    
    if (dashboardData?.stats) {
      const { stats: apiStats } = dashboardData;
      stats.push(
        { label: "Total Users", value: apiStats.totalEmployees || 0, color: "#2563eb", icon: "👥", change: "all employees" },
        { label: "Pending Approvals", value: apiStats.pendingApprovals || 0, color: "#ea580c", icon: "✅", change: "need action" },
        { label: "New Hires", value: apiStats.newHires || 0, color: "#16a34a", icon: "🎉", change: "this month" },
        { label: "Open Grievances", value: apiStats.openGrievances || 0, color: "#dc2626", icon: "📝", change: "unresolved" }
      );
    } else {
      stats.push(...defaultAdminStats);
    }

    // Always add EOD Tracker box dynamically using fetched data
    const eodSubmitted = todayEODSummary?.submitted || 0;
    const eodTotal = todayEODSummary?.total || dashboardData?.stats?.totalEmployees || 0;
    const eodValue = eodTotal > 0 ? `${eodSubmitted}/${eodTotal}` : '0/0';
    const eodColor = eodTotal > 0 && eodSubmitted === eodTotal ? '#16a34a' : '#ea580c';
    const eodChange = eodTotal > 0 ? `${Math.round((eodSubmitted / eodTotal) * 100)}% complete` : 'no data';
    const eodDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    stats.push({
      label: "EOD Tracker",
      value: eodValue,
      color: eodColor,
      icon: "📝",
      change: eodChange,
      date: eodDate
    });

    return stats;
  };

  // Map API department distribution to chart format
  const getDepartmentData = () => {
    if (!dashboardData?.charts?.departmentDistribution || dashboardData.charts.departmentDistribution.length === 0) {
      return defaultDepartmentData;
    }
    const colors = ["#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#dc2626", "#f59e0b"];
    return dashboardData.charts.departmentDistribution.map((dept, index) => ({
      label: dept.label || "Unknown",
      value: dept.value || 0,
      color: colors[index % colors.length],
    }));
  };

  // Map API weekly attendance to chart format
  // API format: { date: "2026-01-18", percentage: 100 }
  const getWeeklyAttendance = () => {
    const raw = dashboardData?.charts?.weeklyAttendance ?? dashboardData?.attendance?.weeklyAttendance ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
      return defaultWeeklyAttendance;
    }
    return raw.map((item) => {
      let label = "—";
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        }
      }
      return {
        label,
        value: item.percentage ?? 0,
      };
    });
  };

  // Fetch recent activities for HR and Admin
  useEffect(() => {
    if (isHRManager || isAdmin) {
      const loadRecentActivities = async () => {
        setIsLoadingActivities(true);
        try {
          const data = await getRecentActivity();
          const activities = Array.isArray(data?.data) ? data.data : [];
          // Take first 4 activities for dashboard
          setRecentActivitiesData(activities.slice(0, 4));
        } catch (error) {
          console.error('Failed to load recent activities:', error);
          setRecentActivitiesData([]);
        } finally {
          setIsLoadingActivities(false);
        }
      };
      loadRecentActivities();
    }
  }, [isHRManager, isAdmin]);

  // Map API activities to UI format
  const getActivities = () => {
    if (!dashboardData?.activities || dashboardData.activities.length === 0) {
      return getPersonalizedActivities(user).slice(0, 4);
    }
    return dashboardData.activities.slice(0, 4).map((activity, index) => {
      const date = new Date(activity.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      let timeStr = "";
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMins = Math.floor(diffTime / (1000 * 60));
          timeStr = diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
        } else {
          timeStr = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
        }
      } else if (diffDays === 1) {
        timeStr = "Yesterday, " + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      } else if (diffDays < 7) {
        timeStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else {
        timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      // Map action types to icons
      const actionIcons = {
        "Checked in": "🟢",
        "Checked out": "🔴",
        "BGV submitted": "🔍",
        "onboarding submitted": "📋",
        "Grievance submitted": "📝",
        "Leave request": "🏖️",
        "Profile updated": "✏️",
      };

      const icon = actionIcons[activity.action] || "📌";
      const type = activity.type === "success" ? "success" : activity.type === "warning" ? "warning" : "info";

      return {
        id: activity._id || index,
        action: activity.action || "Unknown action",
        time: timeStr,
        icon: icon,
        type: type,
      };
    });
  };

  // Map API team data to UI format
  // Dashboard API team: { _id, name, designation, profilePicture, department: { name, _id } }
  const getTeamMembers = () => {
    if (dashboardData?.team && Array.isArray(dashboardData.team) && dashboardData.team.length > 0) {
      return dashboardData.team.slice(0, 4).map((member) => ({
        id: member._id || member.id,
        name: member.name || "Unknown",
        role: member.designation || member.role || "Employee",
        department: member.department?.name || "",
        avatar: (member.name || "U").charAt(0).toUpperCase(),
        profilePicture: member.profilePicture || null,
        status: "online",
      }));
    }
    if (teamMembersData.length > 0) {
      return teamMembersData;
    }
    return teamMembers;
  };
  
  // Get appropriate stats and quick links based on role
  const currentStats = isAdmin ? getAdminStats() : (isHRManager ? getHrStats() : getEmployeeStats(user, todayEODStatus));
  const quickLinks = isAdmin ? adminQuickLinks : (isHRManager ? hrQuickLinks : employeeQuickLinks);
  
  // Get chart data
  const departmentData = (isHRManager || isAdmin) ? getDepartmentData() : [];
  const weeklyAttendanceData = (isHRManager || isAdmin) ? getWeeklyAttendance() : [];
  const activities = getActivities(); // Enable for all roles including admin
  const teamData = (isHRManager || isAdmin) ? getTeamMembers() : [];

  // Helper functions for formatting activities (similar to Settings)
  const getActionTypeStyle = (type) => {
    switch (type) {
      case "approval":
      case "success": return { bg: "#dcfce7", color: "#16a34a", icon: "✅" };
      case "user": return { bg: "#dbeafe", color: "#2563eb", icon: "👤" };
      case "security": return { bg: "#fef3c7", color: "#d97706", icon: "🔐" };
      case "info": return { bg: "#dbeafe", color: "#2563eb", icon: "📋" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "📋" };
    }
  };

  const formatActivityDetails = (item) => {
    const meta = item.metadata || {};
    if (meta.leaveType != null && meta.totalDays != null) return `${meta.leaveType}, ${meta.totalDays} day(s)`;
    if (meta.leaveType) return String(meta.leaveType);
    return item.entityType || "";
  };

  const formatActivityTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday, " + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Fetch published quote for Employee dashboard
  useEffect(() => {
    if (isEmployee) {
      const loadQuote = async () => {
        setIsLoadingQuote(true);
        try {
          const data = await getQuotes();
          const quotes = data?.quotes || data?.data || [];
          if (Array.isArray(quotes) && quotes.length > 0) {
            // Use the first published quote
            const quote = quotes[0];
            setCurrentQuote({
              quote: quote.text || quote.quote || "",
              author: quote.authorName || quote.author || "Unknown"
            });
          } else {
            // Fallback to static quote if no API quotes
            const fallbackQuote = weeklyQuotes[getWeeklyQuoteIndex()];
            setCurrentQuote(fallbackQuote);
          }
        } catch (error) {
          console.error('Failed to load quote:', error);
          // Fallback to static quote on error
          const fallbackQuote = weeklyQuotes[getWeeklyQuoteIndex()];
          setCurrentQuote(fallbackQuote);
        } finally {
          setIsLoadingQuote(false);
        }
      };
      loadQuote();
    }
  }, [isEmployee]);

  // Fetch upcoming events for Employee and HR
  useEffect(() => {
    if (isEmployee || isHRManager) {
      const loadEvents = async () => {
        setIsLoadingEvents(true);
        try {
          const data = await fetchEvents();
          const events = data?.events || [];
          
          // Filter upcoming events (date >= today) and sort by date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcoming = events
            .filter(event => {
              if (!event.date) return false;
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3) // Take first 3
            .map(event => {
              const eventDate = new Date(event.date);
              const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = eventDate.getDate();
              const monthName = eventDate.toLocaleDateString('en-US', { month: 'short' });
              
              // Format date for display
              let dateDisplay = dayName;
              if (eventDate.toDateString() === today.toDateString()) {
                dateDisplay = "Today";
              } else if (eventDate.getTime() - today.getTime() === 86400000) {
                dateDisplay = "Tomorrow";
              } else {
                dateDisplay = `${dayName}, ${monthName} ${dayNumber}`;
              }
              
              // Format time
              let timeDisplay = "";
              if (event.time) {
                const timeStr = event.time;
                // Handle both "HH:MM" and "HH:MM:SS" formats
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                timeDisplay = `${displayHour}:${minutes} ${ampm}`;
              }
              
              return {
                id: event._id || event.id,
                title: event.title || "Untitled Event",
                date: dateDisplay,
                time: timeDisplay || "All Day",
                type: event.type || "meeting",
                originalDate: event.date
              };
            });
          
          setUpcomingEventsData(upcoming);
        } catch (error) {
          console.error('Failed to load events:', error);
          setUpcomingEventsData([]);
        } finally {
          setIsLoadingEvents(false);
        }
      };
      loadEvents();
    }
  }, [isEmployee, isHRManager]);

  // Get current week's quote (fallback if API quote not loaded yet)
  const displayQuote = currentQuote || weeklyQuotes[getWeeklyQuoteIndex()];

  // Generate static attendance data for current month
  const generateAttendanceData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const attendanceData = {};
    
    // Generate static data: mix of Present, Absent, and Late
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        attendanceData[day] = { status: 'weekend', checkInTime: null };
      } else {
        // Randomly assign status: 70% Present, 15% Late, 15% Absent
        const rand = Math.random();
        if (rand < 0.7) {
          // Present - check-in before 9:30 AM
          const checkInHour = Math.floor(Math.random() * 2) + 8; // 8 or 9
          const checkInMinute = checkInHour === 8 ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 30);
          attendanceData[day] = { 
            status: 'present', 
            checkInTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}` 
          };
        } else if (rand < 0.85) {
          // Late - check-in after 9:30 AM
          const checkInHour = Math.floor(Math.random() * 3) + 9; // 9, 10, or 11
          const checkInMinute = checkInHour === 9 ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 60);
          attendanceData[day] = { 
            status: 'late', 
            checkInTime: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}` 
          };
        } else {
          // Absent
          attendanceData[day] = { status: 'absent', checkInTime: null };
        }
      }
    }
    
    return { attendanceData, year, month, daysInMonth, firstDayOfMonth };
  };

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
            <p className={`text-sm sm:text-lg ${isAdmin ? "text-red-100" : "text-blue-100"} mb-2`}>
              {isAdmin
                ? "System administration overview"
                : isHRManager
                ? "Here's your organization overview for today"
                : "Here's what's happening with your work today"}
            </p>
            {isEmployee && user.designation && (
              <p className={`text-xs sm:text-sm ${isAdmin ? "text-red-200" : "text-blue-200"}`}>
                {user.designation} • {user.department} • Employee ID: {user.employeeId}
              </p>
            )}
          </div>
          <div className="hidden md:block animate-float">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl sm:text-5xl">
              {isAdmin ? "🛡️" : isHRManager ? "👔" : "👤"}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Info Card - Employee Only */}
      {isEmployee && (
        <div 
          className="p-6 rounded-2xl animate-fade-in-up"
          style={cardStyle}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Employee Information</h2>
            <div className="text-2xl">👤</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.employeeId && (
              <div className="text-center">
                <p className="text-sm" style={{ color: textSecondary }}>Employee ID</p>
                <p className="font-semibold" style={{ color: textPrimary }}>{user.employeeId}</p>
              </div>
            )}
            {user.department && (
              <div className="text-center">
                <p className="text-sm" style={{ color: textSecondary }}>Department</p>
                <p className="font-semibold" style={{ color: textPrimary }}>{user.department}</p>
              </div>
            )}
            {user.designation && (
              <div className="text-center">
                <p className="text-sm" style={{ color: textSecondary }}>Designation</p>
                <p className="font-semibold" style={{ color: textPrimary }}>{user.designation}</p>
              </div>
            )}
            {user.joiningDate && (
              <div className="text-center">
                <p className="text-sm" style={{ color: textSecondary }}>Joining Date</p>
                <p className="font-semibold" style={{ color: textPrimary }}>
                  {new Date(user.joiningDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          {(user.companyEmail || user.employmentType) && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
              {user.companyEmail && (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: textSecondary }}>Company Email:</span>
                  <span style={{ color: textPrimary }}>{user.companyEmail}</span>
                </div>
              )}
              {user.employmentType && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span style={{ color: textSecondary }}>Employment Type:</span>
                  <span style={{ color: textPrimary }}>{user.employmentType}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
            {isLoadingQuote ? (
              <div className="flex items-center gap-2 py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: colors.primary }} />
                <span style={{ color: textSecondary }}>Loading quote...</span>
              </div>
            ) : (
              <>
                <p 
                  className="text-xl font-medium italic mb-3 leading-relaxed"
                  style={{ color: textPrimary }}
                >
                  "{displayQuote.quote}"
                </p>
                <p 
                  className="text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  — {displayQuote.author}
                </p>
              </>
            )}
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

      {/* Stats Cards - 5 cols for HR/Admin (5 boxes), 6 cols for Employee (6 boxes) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${(isHRManager || isAdmin) ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}>
        {currentStats.map((stat, index) => (
          <div 
            key={index} 
            className={`p-5 hover-lift animate-fade-in-up ${stat.isClickable ? 'cursor-pointer' : ''}`}
            style={{ ...cardStyle, animationDelay: `${index * 0.1}s` }}
            onClick={() => stat.isClickable && isEmployee && setShowCalendarModal(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: stat.color }}>{stat.change}</p>
                {stat.date && (
                  <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{stat.date}</p>
                )}
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
            {isLoadingDashboard ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
              </div>
            ) : dashboardError ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: textSecondary }}>Failed to load chart data</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <PieChart data={departmentData} size={180} strokeWidth={35} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                  {departmentData.slice(0, 6).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs" style={{ color: textSecondary }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Today's Attendance */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Today's Attendance
            </h3>
            {isLoadingAttendance ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
              </div>
            ) : attendanceError ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: textSecondary }}>Failed to load attendance data</p>
              </div>
            ) : (
              <>
                {(() => {
                  const summary = attendanceData?.summary || {};
                  const total = summary.totalEmployees || 0;
                  const present = summary.present || 0;
                  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
                  
                  return (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <DonutChart 
                          percentage={presentPercentage} 
                          size={150} 
                          strokeWidth={15} 
                          color="#16a34a" 
                          label="Present"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: '#16a34a10' }}>
                          <p className="text-lg font-bold" style={{ color: '#16a34a' }}>{present}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>Present</p>
                        </div>
                        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: '#ea580c10' }}>
                          <p className="text-lg font-bold" style={{ color: '#ea580c' }}>{summary.onLeave || 0}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>On Leave</p>
                        </div>
                        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: '#2563eb10' }}>
                          <p className="text-lg font-bold" style={{ color: '#2563eb' }}>{summary.checkedOut || 0}</p>
                          <p className="text-xs" style={{ color: textSecondary }}>Checked Out</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>

          {/* Weekly Attendance Trend */}
          <div className="p-6" style={cardStyle}>
            <h3 className="font-bold text-lg mb-4" style={{ color: textPrimary }}>
              Weekly Attendance %
            </h3>
            {isLoadingDashboard ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
              </div>
            ) : dashboardError ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: textSecondary }}>Failed to load chart data</p>
              </div>
            ) : (
              <BarChart data={weeklyAttendanceData} height={180} />
            )}
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
        {/* Recent Activity - For Employee, HR, and Admin */}
        <div className="lg:col-span-2 p-6 animate-fade-in-up stagger-3" style={cardStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Recent Activity</h2>
          {(isHRManager || isAdmin) ? (
            isLoadingActivities ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
                <span className="ml-3 text-sm" style={{ color: textSecondary }}>Loading activities...</span>
              </div>
            ) : recentActivitiesData.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: textSecondary }}>No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivitiesData.map((activity) => {
                  const typeStyle = getActionTypeStyle(activity.type);
                  const details = formatActivityDetails(activity);
                  return (
                    <div
                      key={activity._id}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ 
                        backgroundColor: isDark ? '#334155' : '#f8fafc',
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: typeStyle.bg }}
                      >
                        {typeStyle.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold" style={{ color: textPrimary }}>{activity.action}</p>
                        <p className="text-sm" style={{ color: textSecondary }}>
                          {activity.userId?.name ?? "—"}
                          {details ? ` · ${details}` : ""}
                        </p>
                        <p className="text-xs mt-1" style={{ color: textSecondary }}>{formatActivityTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            isLoadingDashboard && (isHRManager || isAdmin) ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
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
            )
          )}
        </div>

        {/* Quick Links - For Employee, HR, and Admin */}
        <div className="p-6 animate-fade-in-up stagger-4" style={cardStyle}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>{isAdmin ? "Admin Quick Access" : "Quick Actions"}</h2>
          {isAdmin ? (
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
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="p-4 rounded-xl text-center transition-all hover-lift hover-glow flex flex-col items-center justify-center min-h-[100px]"
                  style={{ 
                    background: `linear-gradient(135deg, ${link.color}15, ${link.color}05)`,
                    border: `1px solid ${link.color}30`
                  }}
                >
                  <span className="text-3xl block mb-2">{link.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold leading-tight text-center" style={{ color: link.color }}>{link.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - For Employee and HR only */}
      {!isAdmin && (
        <div className={`grid grid-cols-1 ${isHRManager ? 'lg:grid-cols-2' : ''} gap-6`}>
          {/* Upcoming Events */}
          <div className="p-6 animate-fade-in-up stagger-5" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Upcoming Events</h2>
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }} />
                <span className="ml-3 text-sm" style={{ color: textSecondary }}>Loading events...</span>
              </div>
            ) : upcomingEventsData.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: textSecondary }}>No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEventsData.map((event) => (
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
                          : event.type === "holiday" || event.type === "company"
                          ? "linear-gradient(135deg, #16a34a, #15803d)"
                          : event.type === "webinar" || event.type === "team"
                          ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                          : "linear-gradient(135deg, #2563eb, #1e3a5f)"
                      }}
                    >
                      {event.date === "Today" || event.date === "Tomorrow" ? (
                        <>
                          <span className="text-lg">📅</span>
                          <span className="text-[10px] opacity-80">{event.date === "Today" ? "Today" : "Tomorrow"}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">{event.date.substring(0, 3)}</span>
                          <span className="text-[10px] opacity-80">{event.date.split(',')[0]}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: textPrimary }}>{event.title}</p>
                      <p className="text-sm" style={{ color: textSecondary }}>{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members - HR Only */}
          {isHRManager && (
            <div className="p-6 animate-fade-in-up stagger-5" style={cardStyle}>
              <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Team Members</h2>
              {isLoadingTeamMembers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamData.length > 0 ? teamData.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}
                  >
                    <div className="relative flex-shrink-0">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
                        >
                          {member.avatar}
                        </div>
                      )}
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ 
                          borderColor: isDark ? '#1e293b' : '#ffffff',
                          backgroundColor: member.status === "online" ? "#16a34a" : member.status === "away" ? "#eab308" : "#94a3b8"
                        }}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: textPrimary }}>{member.name}</p>
                      <p className="text-sm truncate" style={{ color: textSecondary }}>
                        {[member.department, member.role].filter(Boolean).join(" · ") || member.role}
                      </p>
                    </div>
                  </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: textSecondary }}>No team members available</p>
                    </div>
                  )}
                </div>
              )}
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

      {/* Attendance Calendar Modal - Employee Only */}
      {isEmployee && showCalendarModal && (() => {
        const { attendanceData, year, month, daysInMonth, firstDayOfMonth } = generateAttendanceData();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        const getStatusColor = (status) => {
          switch (status) {
            case 'present': return { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' };
            case 'late': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
            case 'absent': return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
            case 'weekend': return { bg: isDark ? '#334155' : '#f1f5f9', text: isDark ? '#94a3b8' : '#64748b', border: isDark ? '#475569' : '#e2e8f0' };
            default: return { bg: isDark ? '#334155' : '#f8fafc', text: textSecondary, border: isDark ? '#475569' : '#e2e8f0' };
          }
        };

        return (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={() => setShowCalendarModal(false)}
          >
            <div
              className="w-full max-w-4xl animate-scale-in"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="p-6 border-b"
                style={{
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  borderColor: isDark ? '#334155' : '#e2e8f0'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Monthly Attendance Calendar</h2>
                    <p className="text-blue-100 text-sm mt-1">{monthNames[month]} {year}</p>
                  </div>
                  <button
                    onClick={() => setShowCalendarModal(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Calendar Body */}
              <div className="p-6">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Late (after 9:30 AM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}></div>
                    <span className="text-sm" style={{ color: textPrimary }}>Weekend</span>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
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
                    const dayData = attendanceData[day];
                    const statusColors = getStatusColor(dayData?.status);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                    return (
                      <div
                        key={day}
                        className="aspect-square p-1 rounded-lg transition-all hover:scale-105"
                        style={{
                          backgroundColor: statusColors.bg,
                          border: `2px solid ${isToday ? '#2563eb' : statusColors.border}`,
                          cursor: dayData?.status !== 'weekend' ? 'pointer' : 'default'
                        }}
                        title={dayData?.checkInTime ? `Check-in: ${dayData.checkInTime}` : dayData?.status === 'weekend' ? 'Weekend' : 'No check-in'}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span
                            className="text-sm font-bold"
                            style={{ color: statusColors.text }}
                          >
                            {day}
                          </span>
                          {dayData?.checkInTime && (
                            <span
                              className="text-[10px] mt-0.5"
                              style={{ color: statusColors.text }}
                            >
                              {dayData.checkInTime}
                            </span>
                          )}
                          {dayData?.status === 'late' && (
                            <span className="text-[10px] mt-0.5" style={{ color: '#d97706' }}>⚠️</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
