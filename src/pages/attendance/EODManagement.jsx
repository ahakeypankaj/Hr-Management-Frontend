import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { fetchEODDetails, fetchEmployeeEOD, downloadEODExcel } from "../../services/eodService";

export default function EODManagement() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const isDark = theme === "dark";

    const queryParams = new URLSearchParams(location.search);
    const isPersonalView = queryParams.get('view') === 'personal';

    const isHRManager = (user?.role === "hr_manager" || user?.role === "admin") && !isPersonalView;

    // Set default dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    const [dateRange, setDateRange] = useState({
        from: isHRManager ? formatDateForInput(today) : formatDateForInput(twoWeeksAgo),
        to: formatDateForInput(today)
    });

    // Reset date range when view mode changes
    useEffect(() => {
        setDateRange({
            from: isHRManager ? formatDateForInput(today) : formatDateForInput(twoWeeksAgo),
            to: formatDateForInput(today)
        });
    }, [isHRManager]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eodData, setEodData] = useState([]);
    const [summary, setSummary] = useState({
        totalEmployees: 0,
        submittedToday: 0,
        missedEODCount: 0,
        totalWorkingHoursToday: 0
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const ITEMS_PER_PAGE = 10;

    const navyBlue = '#1e3a5f';
    const cardStyle = {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: '16px',
    };
    const textPrimary = isDark ? '#f8fafc' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';
    const inputStyle = {
        backgroundColor: isDark ? '#334155' : '#f8fafc',
        border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
        color: textPrimary
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (isHRManager) {
                const params = {
                    startDate: dateRange.from,
                    endDate: dateRange.to,
                    search: searchTerm || undefined,
                    status: statusFilter !== "All" ? statusFilter : undefined,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE
                };
                const data = await fetchEODDetails(params);

                // Format eods for table
                const formattedEods = (data.eods || []).map(e => ({
                    id: e._id,
                    employeeId: e.employee?.employeeId,
                    name: e.employee?.name,
                    email: e.employee?.email,
                    status: formatStatus(e),
                    submissionTime: e.time ? new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                    projects: Array.isArray(e.summary) ? [...new Set(e.summary.map(s => s.project || s.projectName).filter(Boolean))].join(', ') : '-',
                    workingHours: e.totalWorkingHours || 0,
                    tasks: formatSummary(e.summary),
                    date: e.date ? new Date(e.date).toLocaleDateString() : '-'
                }));

                setEodData(formattedEods);
                setTotalPages(data.totalPages || 1);
                setTotalRecords(data.total || 0);

                // Robustly set summary stats
                const stats = data.stats || data.summary || {};
                setSummary({
                    totalEmployees: stats.totalEmployees || stats.total || 0,
                    submittedToday: stats.submittedToday || stats.submitted || stats.totalSubmitted || 0,
                    missedEODCount: stats.missedEODCount || stats.missed || stats.totalMissed || 0,
                    totalWorkingHoursToday: stats.totalWorkingHoursToday || stats.totalHours || 0
                });
            } else {
                const data = await fetchEmployeeEOD(user.id, dateRange.from, dateRange.to, currentPage, ITEMS_PER_PAGE);
                const empEods = data.eods || [];

                const formattedEods = empEods.map(e => ({
                    id: e._id,
                    date: e.date ? new Date(e.date).toLocaleDateString() : '-',
                    status: formatStatus(e),
                    submissionTime: e.time ? new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                    projects: Array.isArray(e.summary) ? [...new Set(e.summary.map(s => s.project || s.projectName).filter(Boolean))].join(', ') : '-',
                    workingHours: e.totalWorkingHours || 0,
                    tasks: formatSummary(e.summary)
                }));

                setEodData(formattedEods);
                setTotalPages(data.totalPages || 1);
                setTotalRecords(data.total || 0);
            }
        } catch (err) {
            console.error("Error fetching EOD data:", err);
            setError("Failed to load EOD data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatStatus = (eod) => {
        if (eod.leaveStatus === 'sick') return 'Sick Leave';
        if (eod.leaveStatus === 'annual') return 'Annual Leave';
        if (eod.eodStatus === 'submitted') return 'Submitted';
        return 'Missed';
    };

    const formatSummary = (summary) => {
        if (Array.isArray(summary)) {
            return summary.map(s => `${s.project || s.projectName}: ${s.task || s.description} (${s.hours || s.workingHours}h)`).join(', ');
        }
        if (typeof summary === 'string') return summary;
        return '-';
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange, isHRManager, searchTerm, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [dateRange, isHRManager, searchTerm, statusFilter, currentPage]);

    const handleExport = async () => {
        try {
            const response = await downloadEODExcel(dateRange.from, dateRange.to);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `EOD_Report_${dateRange.from}_to_${dateRange.to}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed:", err);
            alert("Export failed. Please try again.");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Submitted": return { bg: "#dcfce7", color: "#16a34a", icon: "✅" };
            case "Missed": return { bg: "#fee2e2", color: "#dc2626", icon: "❌" };
            case "Sick Leave": return { bg: "#dbeafe", color: "#2563eb", icon: "🤒" };
            case "Annual Leave": return { bg: "#f3e8ff", color: "#9333ea", icon: "🌴" };
            default: return { bg: "#f1f5f9", color: "#64748b", icon: "⚪" };
        }
    };

    // Helper to format the displayed date in the header
    const getHeaderDate = () => {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        const options = { month: "short", day: "numeric" };

        if (dateRange.from === dateRange.to) {
            return fromDate.toLocaleDateString("en-US", options);
        }
        return `${fromDate.toLocaleDateString("en-US", options)} - ${toDate.toLocaleDateString("en-US", options)}`;
    };

    // Calculate stats for the selected range from the current table data
    const rangeSubmitted = eodData.filter(e => e.status === "Submitted").length;
    const rangeMissed = eodData.filter(e => e.status === "Missed").length;

    return (
        <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>
                        EOD History
                    </h1>
                    <p className="text-sm sm:text-base" style={{ color: textSecondary }}>
                        {isHRManager ? "Track all employees' End of Day reports" : "View your EOD history and statistics"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {isHRManager && (
                        <>
                            <div
                                className="flex items-center gap-3 px-4 py-2 rounded-xl"
                                style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm">Today:</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">✅</span>
                                        <span className="text-sm font-bold" style={{ color: '#16a34a' }}>{summary.submittedToday}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">❌</span>
                                        <span className="text-sm font-bold" style={{ color: '#dc2626' }}>{summary.missedEODCount}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center gap-2"
                                style={{ background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)` }}
                            >
                                <span>📊</span> Export Excel
                            </button>
                        </>
                    )}
                    <div
                        className="text-right px-4 py-2 rounded-xl min-w-[120px]"
                        style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}
                    >
                        <p className="text-sm font-bold text-white">
                            {getHeaderDate()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats - HR Only */}
            {isHRManager && (
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 animate-fade-in-up">
                    {[
                        { label: "EOD: Submitted", value: rangeSubmitted, icon: "📊", color: "#2563eb" },
                        { label: "EOD: Missed", value: rangeMissed, icon: "📉", color: "#f59e0b" },
                    ].map((stat, i) => (
                        <div key={i} className="p-4" style={cardStyle}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p style={{ color: textSecondary }} className="text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                                    <p style={{ color: textPrimary }} className="text-2xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${stat.color}15` }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters & Date Range */}
            <div className="p-5 animate-fade-in-up" style={cardStyle}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider pl-1" style={{ color: textSecondary }}>From Date</label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="px-4 py-2.5 rounded-xl outline-none"
                            style={inputStyle}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider pl-1" style={{ color: textSecondary }}>To Date</label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="px-4 py-2.5 rounded-xl outline-none"
                            style={inputStyle}
                        />
                    </div>

                    {isHRManager && (
                        <>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase tracking-wider pl-1" style={{ color: textSecondary }}>Search</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Name or Email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase tracking-wider pl-1" style={{ color: textSecondary }}>Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl outline-none"
                                    style={inputStyle}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="Missed">Missed</option>
                                    <option value="Sick Leave">Sick Leave</option>
                                    <option value="Annual Leave">Annual Leave</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center text-xs" style={{ color: textSecondary }}>
                    <p>Total Records: {totalRecords} | Page {currentPage} of {totalPages}</p>
                    <button
                        onClick={fetchData}
                        className="font-bold hover:opacity-80 transition-all flex items-center gap-1"
                        style={{ color: navyBlue }}
                    >
                        <span>🔄</span> Refresh Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
                {isLoading ? (
                    <div className="p-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: navyBlue }}></div>
                        <p style={{ color: textSecondary }}>Fetching data...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-red-500">
                        <p className="text-4xl mb-4">⚠️</p>
                        <p>{error}</p>
                    </div>
                ) : eodData.length === 0 ? (
                    <div className="p-20 text-center">
                        <p className="text-5xl mb-4">📝</p>
                        <p className="text-lg font-bold" style={{ color: textPrimary }}>No EOD records found</p>
                        <p style={{ color: textSecondary }}>Try adjusting your filters or date range</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                                <tr>
                                    {isHRManager ? (
                                        <>
                                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Employee</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Project Name</th>
                                            <th className="px-2 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: textSecondary }}>Worked Hours</th>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Status</th>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: textSecondary }}>Submission Time</th>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Date</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-full" style={{ color: textSecondary }}>Task Summary</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Date</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Project Name</th>
                                            <th className="px-2 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: textSecondary }}>Worked Hours</th>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: textSecondary }}>Status</th>
                                            <th className="px-3 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: textSecondary }}>Submission Time</th>
                                            <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-full" style={{ color: textSecondary }}>Task Summary</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                {eodData.map((row, idx) => {
                                    const statusStyle = getStatusStyle(row.status);
                                    return (
                                        <tr key={idx} className="hover:bg-opacity-50 transition-all">
                                            {isHRManager ? (
                                                <>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
                                                                style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                                                            >
                                                                {(row.name || "U").charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-sm truncate" style={{ color: textPrimary }}>{row.name}</p>
                                                                <p className="text-xs truncate" style={{ color: textSecondary }}>{row.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-medium" style={{ color: textPrimary }}>{row.projects}</div>
                                                    </td>
                                                    <td className="px-2 py-4 text-sm font-bold whitespace-nowrap" style={{ color: textPrimary }}>{row.workingHours}h</td>
                                                    <td className="px-3 py-4 text-sm">
                                                        <span
                                                            className="px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit whitespace-nowrap"
                                                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '11px' }}
                                                        >
                                                            {statusStyle.icon} {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm font-medium whitespace-nowrap" style={{ color: textSecondary }}>{row.submissionTime}</td>
                                                    <td className="px-3 py-4 text-sm whitespace-nowrap" style={{ color: textPrimary }}>{row.date}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-wrap" style={{ color: textSecondary }}>
                                                            {row.tasks}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-3 py-4 text-sm font-semibold whitespace-nowrap" style={{ color: textPrimary }}>{row.date}</td>
                                                    <td className="px-4 py-4 text-sm font-medium" style={{ color: textPrimary }}>{row.projects}</td>
                                                    <td className="px-2 py-4 text-sm font-bold whitespace-nowrap" style={{ color: textPrimary }}>{row.workingHours}h</td>
                                                    <td className="px-3 py-4 text-sm">
                                                        <span
                                                            className="px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit whitespace-nowrap"
                                                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '11px' }}
                                                        >
                                                            {statusStyle.icon} {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm font-medium whitespace-nowrap" style={{ color: textSecondary }}>{row.submissionTime}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-wrap" style={{ color: textSecondary }}>
                                                            {row.tasks}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="p-4 flex items-center justify-between border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                                    style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                                >
                                    Previous
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'text-white' : ''}`}
                                            style={{
                                                backgroundColor: currentPage === i + 1 ? navyBlue : (isDark ? '#334155' : '#f1f5f9'),
                                                color: currentPage === i + 1 ? 'white' : textPrimary
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                                    style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
