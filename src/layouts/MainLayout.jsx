import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHRManager = user?.role === "hr_manager";
  const isAdmin = user?.role === "admin";
  const isDark = theme === "dark";

  const navyBlue = '#1e3a5f';

  // Mock notifications
  const notifications = [
    { id: 1, title: "Leave Approved", message: "Your casual leave has been approved", time: "2 min ago", read: false, type: "success" },
    { id: 2, title: "New Announcement", message: "Holiday notice for Christmas", time: "1 hour ago", read: false, type: "info" },
    { id: 3, title: "Performance Review", message: "Submit your self-review by Dec 31", time: "3 hours ago", read: true, type: "warning" },
    { id: 4, title: "Attendance Reminder", message: "You haven't checked in today", time: "5 hours ago", read: true, type: "alert" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Employee Menu Items (removed Directory and Onboarding)
  const employeeMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Attendance", path: "/attendance", icon: "⏰" },
    { name: "Leave Management", path: "/leave", icon: "🏖️" },
    { name: "Expenses", path: "/expense", icon: "💰" },
    { name: "Grievance", path: "/grievance", icon: "📝" },
    { name: "Performance", path: "/performance", icon: "🎯" },
    { name: "Events & Kudos", path: "/events", icon: "🎉" },
  ];

  // HR/Manager Menu Items
  const hrMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Approvals", path: "/hr/approvals", icon: "✅", highlight: true },
    { name: "User Management", path: "/hr/team", icon: "👥" },
    { name: "Add Employee", path: "/hr/users/add", icon: "➕" },
    { name: "Attendance Mgmt", path: "/hr/attendance", icon: "⏰" },
    { name: "Grievance Mgmt", path: "/hr/grievances", icon: "📝" },
    { name: "Directory", path: "/directory", icon: "📖" },
    { name: "Performance Hub", path: "/hr/performance", icon: "📈" },
    { name: "Events & Kudos", path: "/events", icon: "🎉" },
    { name: "Reports", path: "/hr/reports", icon: "📑" },
    { name: "Settings & Audit", path: "/hr/settings", icon: "🔧" },
    { divider: true, label: "My Features" },
    { name: "My Profile", path: "/profile", icon: "👤" },
    { name: "Attendance", path: "/attendance", icon: "⏰" },
    { name: "Leave Management", path: "/leave", icon: "🏖️" },
    { name: "Expenses", path: "/expense", icon: "💰" },
  ];

  // Admin Menu Items (Full authority - no profile, no leave management, no onboarding)
  const adminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { divider: true, label: "User Administration" },
    { name: "User Management", path: "/hr/team", icon: "👥" },
    { name: "Add Employee", path: "/hr/users/add", icon: "➕" },
    { name: "Approvals", path: "/hr/approvals", icon: "✅", highlight: true },
    { divider: true, label: "Organization" },
    { name: "Attendance Mgmt", path: "/hr/attendance", icon: "⏰" },
    { name: "Grievance Mgmt", path: "/hr/grievances", icon: "📝" },
    { name: "Directory", path: "/directory", icon: "📖" },
    { name: "Performance Hub", path: "/hr/performance", icon: "📈" },
    { name: "Events & Kudos", path: "/events", icon: "🎉" },
    { divider: true, label: "System" },
    { name: "Reports", path: "/hr/reports", icon: "📑" },
    { name: "Settings", path: "/hr/settings", icon: "🔧" },
  ];

  const menu = isAdmin ? adminMenu : (isHRManager ? hrMenu : employeeMenu);

  const getRoleLabel = () => {
    if (isAdmin) return "Administrator";
    if (isHRManager) return "HR/Manager";
    return "Employee";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success": return "✅";
      case "info": return "📢";
      case "warning": return "⚠️";
      case "alert": return "🔔";
      default: return "📩";
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      {/* TOP HEADER */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 animate-fade-in-down"
        style={{ 
          backgroundColor: navyBlue,
          boxShadow: '0 4px 20px rgba(30, 58, 95, 0.3)'
        }}
      >
        {/* LEFT - Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg transition-all hover:bg-white/10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#ffffff' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">Irish Taylor & Co</h1>
          </div>
        </div>

        {/* RIGHT - User Info + Notifications + Theme Toggle + Logout */}
        <div className="flex items-center gap-2">
          {/* User Info - Admin has no profile link */}
          {isAdmin ? (
            <div 
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-red-400/50"
                style={{ backgroundColor: 'rgba(220, 38, 38, 0.3)' }}
              >
                🛡️
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-red-200">{getRoleLabel()}</p>
              </div>
            </div>
          ) : (
            <Link 
              to="/profile"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm border-2 border-white/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-blue-200">{getRoleLabel()}</p>
              </div>
            </Link>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl transition-all hover:bg-white/10 relative"
              style={{ color: '#ffffff' }}
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div 
                className="absolute right-0 sm:right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl shadow-2xl overflow-hidden animate-fade-in-down z-50"
                style={{ 
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                }}
              >
                <div 
                  className="p-4 font-bold flex items-center justify-between"
                  style={{ 
                    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    color: isDark ? '#f8fafc' : '#0f172a'
                  }}
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: '#dc262620', color: '#dc2626' }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-4 flex gap-3 cursor-pointer transition-all hover:bg-opacity-50"
                      style={{ 
                        backgroundColor: !notif.read ? (isDark ? '#334155' : '#f8fafc') : 'transparent',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                      }}
                    >
                      <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {notif.title}
                        </p>
                        <p className="text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: navyBlue }}>{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: navyBlue }}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div 
                  className="p-3 text-center text-sm font-semibold cursor-pointer transition-all hover:opacity-80"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: navyBlue }}
                >
                  View All Notifications
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all hover:bg-white/10"
            style={{ color: isDark ? '#fbbf24' : '#ffffff' }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.9)', color: '#ffffff' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Click outside to close notifications - positioned to not cover sidebar */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className="fixed top-16 left-0 bottom-0 w-64 z-50 flex flex-col transition-transform duration-300 animate-fade-in-left"
        style={{ 
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          boxShadow: isDark ? 'none' : '4px 0 20px rgba(30, 58, 95, 0.05)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Role Badge */}
        <div className="p-4 flex-shrink-0">
          <div
            className="px-4 py-3 rounded-xl text-center font-semibold text-sm text-white"
            style={{ 
              backgroundColor: isAdmin ? '#dc2626' : (isHRManager ? '#7c3aed' : navyBlue),
              boxShadow: `0 4px 15px ${isAdmin ? 'rgba(220, 38, 38, 0.3)' : (isHRManager ? 'rgba(124, 58, 237, 0.3)' : 'rgba(30, 58, 95, 0.3)')}`
            }}
          >
            {isAdmin ? "🛡️ Administrator Access" : (isHRManager ? "👔 HR/Manager Access" : "👤 Employee Access")}
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="px-3 flex-1 overflow-y-auto">
          {menu.map((item, index) => {
            if (item.divider) {
              return (
                <div 
                  key={`divider-${index}`} 
                  className="mt-4 mb-2 px-4 pt-4"
                  style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
                >
                  <span className="text-xs font-semibold uppercase" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    {item.label}
                  </span>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 font-medium transition-all cursor-pointer text-left"
                style={{ 
                  backgroundColor: isActive ? navyBlue : 'transparent',
                  color: isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
                  boxShadow: isActive ? '0 4px 15px rgba(30, 58, 95, 0.3)' : 'none',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.name}</span>
                {item.highlight && (
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                  >
                    3
                  </span>
                )}
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-white flex-shrink-0"></div>
                )}
              </button>
            );
          })}
          <div className="pb-4"></div>
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div 
          className="p-4 flex-shrink-0"
          style={{ 
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
          }}
        >
          <div 
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9' }}
          >
            <p className="text-xs font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Irish Taylor & Co
            </p>
            <p className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              2025 All Rights Reserved
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="pt-20 pb-8 px-6 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '256px' : '0' }}
      >
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="py-4 text-center text-sm transition-all duration-300"
        style={{ 
          marginLeft: sidebarOpen ? '256px' : '0',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#64748b' : '#64748b',
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}
      >
        <div className="flex items-center justify-center gap-2">
          {/* <span>Made with</span>
          <span className="text-red-500">For</span> */}
          <span>Irish Taylor & Co</span>
        </div>
      </footer>
    </div>
  );
}
