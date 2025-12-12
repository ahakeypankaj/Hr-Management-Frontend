import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Original Navy Blue Colors
  const navyBlue = '#1e3a5f';
  const darkNavy = '#0f172a';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (email === "employee@company.com" && password === "employee123") {
      login("employee", "Asha Kumar", "EMP001");
    } else if (email === "hr@company.com" && password === "hr123") {
      login("hr_manager", "Ravi Sharma", "HRM001");
    } else if (email === "admin@company.com" && password === "admin123") {
      login("admin", "System Admin", "ADM001");
    } else {
      setError("Invalid email or password. Try demo credentials.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => login("employee", "Google User", "EMP003");
  const handleMicrosoftLogin = () => login("employee", "Microsoft User", "EMP004");

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-xl transition-all shadow-lg hover:scale-110"
        style={{ 
          backgroundColor: isDark ? '#334155' : '#ffffff',
          color: isDark ? '#fbbf24' : navyBlue,
          border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
        }}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDE - Navy Blue Branding Panel */}
        <div 
          className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
          style={{ backgroundColor: navyBlue }}
        >
          {/* Animated Background Circles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.05)', animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}></div>
          </div>

          <div className="relative z-10 text-center max-w-lg animate-fade-slide-up">
            <div className="mb-8">
              {/* Logo Icon */}
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <svg className="w-12 h-12" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white mb-2">HR Nexus</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)' }} className="text-lg">Human Resource Management System</p>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Welcome Back!</h2>
            <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Your complete human resource management solution. Streamline operations, empower your team.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { icon: "👥", title: "Employee Management", desc: "Manage workforce efficiently" },
                { icon: "⏰", title: "Attendance Tracking", desc: "Real-time monitoring" },
                { icon: "📊", title: "Analytics & Reports", desc: "Data-driven decisions" },
                { icon: "🚀", title: "Easy Onboarding", desc: "Seamless onboarding" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="rounded-xl p-4 transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold mb-1 text-white">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 flex justify-center gap-12">
              {[["500+", "Companies"], ["50K+", "Employees"], ["99%", "Satisfaction"]].map(([val, label], i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl font-bold text-white">{val}</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div 
          className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: isDark ? darkNavy : '#ffffff' }}
        >
          <div className="w-full max-w-md animate-fade-in-right">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-3"
                style={{ backgroundColor: navyBlue }}
              >
                <svg className="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: isDark ? '#ffffff' : darkNavy }}>HR Nexus</h1>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: isDark ? '#ffffff' : darkNavy }}>Sign In</h1>
              <p className="mt-2 text-sm sm:text-base" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Welcome back! Please enter your credentials.</p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              {/* <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{ 
                  border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#ffffff' : darkNavy
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button> */}
              <button
                onClick={handleMicrosoftLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{ 
                  border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#ffffff' : darkNavy
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#00A4EF" d="M1 13h10v10H1z" />
                  <path fill="#7FBA00" d="M13 1h10v10H13z" />
                  <path fill="#FFB900" d="M13 13h10v10H13z" />
                </svg>
                Continue with Microsoft
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ backgroundColor: isDark ? darkNavy : '#ffffff', color: isDark ? '#94a3b8' : '#64748b' }}>or sign in with email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div 
                  className="px-4 py-3 rounded-xl text-sm animate-fade-in-up"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  ⚠️ {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? '#ffffff' : darkNavy }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
                  style={{ 
                    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#ffffff' : darkNavy
                  }}
                  placeholder="name@company.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? '#ffffff' : darkNavy }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl outline-none transition-all"
                  style={{ 
                    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#ffffff' : darkNavy
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="ml-2 text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold" style={{ color: navyBlue }}>Forgot password?</a>
              </div>

              {/* Sign In Button - Navy Blue */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 text-white font-bold rounded-xl transition-all disabled:opacity-50 hover:opacity-90"
                style={{ 
                  backgroundColor: navyBlue,
                  boxShadow: '0 4px 20px rgba(30, 58, 95, 0.4)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div 
              className="mt-8 p-5 rounded-xl"
              style={{ 
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}
            >
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: isDark ? '#ffffff' : darkNavy }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: navyBlue, color: '#fff' }}>💡</span>
                Demo Credentials
              </p>
              <div className="space-y-2 text-sm">
                <div 
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: isDark ? darkNavy : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                >
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>👤 Employee</span>
                  <code style={{ color: navyBlue, fontSize: '11px' }}>employee@company.com / employee123</code>
                </div>
                <div 
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: isDark ? darkNavy : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                >
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>👔 HR/Manager</span>
                  <code style={{ color: navyBlue, fontSize: '11px' }}>hr@company.com / hr123</code>
                </div>
                <div 
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: isDark ? darkNavy : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                >
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>🛡️ Admin</span>
                  <code style={{ color: navyBlue, fontSize: '11px' }}>admin@company.com / admin123</code>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              Don't have an account? <a href="#" className="font-bold" style={{ color: navyBlue }}>Contact Admin</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Dark Navy */}
      {/* <footer style={{ backgroundColor: darkNavy }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: navyBlue }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">HR Nexus</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Empowering organizations with modern HR solutions.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>© {new Date().getFullYear()} HR Nexus. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
