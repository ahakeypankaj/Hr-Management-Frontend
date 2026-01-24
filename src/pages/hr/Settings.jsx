import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../services/departmentService";
import { getAllQuotes, createQuote } from "../../services/quoteService";
import { getAllAnnouncements, createAnnouncement } from "../../services/announcementService";
import { getRecentActivity } from "../../services/activityService";
import { getLeavePolicies, createLeavePolicy, updateLeavePolicy, deleteLeavePolicy } from "../../services/leaveService";

export default function Settings() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [activeTab, setActiveTab] = useState("audit");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);

  const [activities, setActivities] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  const [quotes, setQuotes] = useState([]);
  const [quoteForm, setQuoteForm] = useState({ text: "", authorName: "", publishDate: "" });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [quoteSaving, setQuoteSaving] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "" });
  const [deptSaving, setDeptSaving] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    audienceType: "all",
    expiresAt: "",
    isPinned: false,
  });
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementError, setAnnouncementError] = useState(null);
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const [policies, setPolicies] = useState([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyError, setPolicyError] = useState(null);
  const [policyForm, setPolicyForm] = useState({
    leaveType: "",
    totalDays: 0,
    carryOver: 0,
    maxConsecutiveDays: 0,
    noticePeriodDays: 0,
  });
  const [policySaving, setPolicySaving] = useState(false);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';

  const tabs = [
    { id: "audit", label: "Audit Logs", icon: "📋" },
    { id: "policies", label: "Leave Policies", icon: "📝" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "quotes", label: "Weekly Quotes", icon: "💬" },
    { id: "announcements", label: "Announcements", icon: "📢" },
  ];

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
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const getQuoteStatusStyle = (status) => {
    switch (status) {
      case "published": return { bg: "#dcfce7", color: "#16a34a", label: "🟢 Published" };
      case "draft": return { bg: "#dbeafe", color: "#2563eb", label: "📅 Draft" };
      default: return { bg: "#f1f5f9", color: "#64748b", label: status || "—" };
    }
  };

  const fetchDepartments = async () => {
    setDeptLoading(true);
    setDeptError(null);
    try {
      const data = await getDepartments();
      setDepartments(data?.departments ?? []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setDeptError(err?.response?.data?.message || err?.message || "Failed to load departments");
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const data = await getRecentActivity();
      setActivities(Array.isArray(data?.data) ? data.data : []);
      setAuditPage(1);
    } catch (err) {
      console.error("Failed to fetch recent activity:", err);
      setAuditError(err?.response?.data?.message || err?.message || "Failed to load recent activity");
      setActivities([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchQuotes = async () => {
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const data = await getAllQuotes();
      setQuotes(data?.quotes ?? data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
      setQuoteError(err?.response?.data?.message || err?.message || "Failed to load quotes");
      setQuotes([]);
    } finally {
      setQuoteLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setAnnouncementLoading(true);
    setAnnouncementError(null);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data?.announcements ?? []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setAnnouncementError(err?.response?.data?.message || err?.message || "Failed to load announcements");
      setAnnouncements([]);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const fetchPolicies = async () => {
    setPolicyLoading(true);
    setPolicyError(null);
    try {
      const data = await getLeavePolicies();
      setPolicies(data?.policies ?? []);
    } catch (err) {
      console.error("Failed to fetch leave policies:", err);
      setPolicyError(err?.response?.data?.message || err?.message || "Failed to load leave policies");
      setPolicies([]);
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") fetchRecentActivity();
    if (activeTab === "policies") fetchPolicies();
    if (activeTab === "departments") fetchDepartments();
    if (activeTab === "quotes") fetchQuotes();
    if (activeTab === "announcements") fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (type === "department") {
      setDeptForm(item ? { name: item.name || "", code: item.code || "", description: item.description || "" } : { name: "", code: "", description: "" });
    }
    if (type === "policy") {
      setPolicyForm(
        item
          ? {
              leaveType: item.leaveType || "",
              totalDays: item.totalDays ?? 0,
              carryOver: item.carryOver ?? 0,
              maxConsecutiveDays: item.maxConsecutiveDays ?? 0,
              noticePeriodDays: item.noticePeriodDays ?? 0,
            }
          : { leaveType: "", totalDays: 0, carryOver: 0, maxConsecutiveDays: 0, noticePeriodDays: 0 }
      );
    }
    setShowModal(true);
  };

  const handleSaveDepartment = async () => {
    if (!deptForm.name?.trim() || !deptForm.code?.trim()) return;
    setDeptSaving(true);
    setDeptError(null);
    try {
      if (editItem?._id) {
        await updateDepartment(editItem._id, { name: deptForm.name.trim(), code: deptForm.code.trim() });
      } else {
        await createDepartment({
          name: deptForm.name.trim(),
          code: deptForm.code.trim(),
          ...(deptForm.description?.trim() && { description: deptForm.description.trim() }),
        });
      }
      await fetchDepartments();
      setShowModal(false);
      setDeptForm({ name: "", code: "", description: "" });
    } catch (err) {
      console.error("Failed to save department:", err);
      setDeptError(err?.response?.data?.message || err?.message || "Failed to save department");
    } finally {
      setDeptSaving(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    setDeptError(null);
    try {
      await deleteDepartment(id);
      await fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department:", err);
      setDeptError(err?.response?.data?.message || err?.message || "Failed to delete department");
    }
  };

  const handleSavePolicy = async () => {
    if (!policyForm.leaveType?.trim()) return;
    setPolicySaving(true);
    setPolicyError(null);
    const payload = {
      leaveType: policyForm.leaveType.trim().toLowerCase(),
      totalDays: Number(policyForm.totalDays) || 0,
      carryOver: Number(policyForm.carryOver) || 0,
      maxConsecutiveDays: Number(policyForm.maxConsecutiveDays) || 0,
      noticePeriodDays: Number(policyForm.noticePeriodDays) || 0,
    };
    try {
      if (editItem?._id) {
        await updateLeavePolicy(editItem._id, payload);
      } else {
        await createLeavePolicy(payload);
      }
      await fetchPolicies();
      setShowModal(false);
      setPolicyForm({ leaveType: "", totalDays: 0, carryOver: 0, maxConsecutiveDays: 0, noticePeriodDays: 0 });
    } catch (err) {
      console.error("Failed to save leave policy:", err);
      setPolicyError(err?.response?.data?.message || err?.message || "Failed to save leave policy");
    } finally {
      setPolicySaving(false);
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave policy?")) return;
    setPolicyError(null);
    try {
      await deleteLeavePolicy(id);
      await fetchPolicies();
    } catch (err) {
      console.error("Failed to delete leave policy:", err);
      setPolicyError(err?.response?.data?.message || err?.message || "Failed to delete leave policy");
    }
  };

  const handleCreateQuote = async () => {
    if (!quoteForm.text?.trim() || !quoteForm.authorName?.trim() || !quoteForm.publishDate) return;
    setQuoteSaving(true);
    setQuoteError(null);
    try {
      await createQuote({
        text: quoteForm.text.trim(),
        authorName: quoteForm.authorName.trim(),
        publishDate: quoteForm.publishDate,
      });
      setQuoteForm({ text: "", authorName: "", publishDate: "" });
      await fetchQuotes();
    } catch (err) {
      console.error("Failed to create quote:", err);
      setQuoteError(err?.response?.data?.message || err?.message || "Failed to create quote");
    } finally {
      setQuoteSaving(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title?.trim() || !announcementForm.message?.trim()) return;
    setAnnouncementSaving(true);
    setAnnouncementError(null);
    try {
      const payload = {
        title: announcementForm.title.trim(),
        message: announcementForm.message.trim(),
        priority: announcementForm.priority || "normal",
        audienceType: announcementForm.audienceType || "all",
        isPinned: !!announcementForm.isPinned,
      };
      if (announcementForm.expiresAt) {
        const d = new Date(announcementForm.expiresAt);
        d.setHours(23, 59, 59, 999);
        payload.expiresAt = d.toISOString();
      }
      await createAnnouncement(payload);
      setAnnouncementForm({ title: "", message: "", priority: "normal", audienceType: "all", expiresAt: "", isPinned: false });
      await fetchAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      setAnnouncementError(err?.response?.data?.message || err?.message || "Failed to create announcement");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Settings & Audit</h1>
          <p style={{ color: textSecondary }}>Manage policies, departments, quotes, and view system activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl animate-fade-in-up overflow-x-auto" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
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

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Recent Activity</h2>
            <button
              onClick={fetchRecentActivity}
              disabled={auditLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
            >
              {auditLoading ? "⏳ Loading…" : "🔄 Refresh"}
            </button>
          </div>
          {auditError ? (
            <div className="p-6 text-center">
              <p className="font-medium mb-3" style={{ color: textSecondary }}>{auditError}</p>
              <button
                onClick={fetchRecentActivity}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: navyBlue }}
              >
                Retry
              </button>
            </div>
          ) : auditLoading ? (
            <div className="p-12 flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: navyBlue }} />
              <span style={{ color: textSecondary }}>Loading recent activity…</span>
            </div>
          ) : activities.length === 0 ? (
            <p className="p-12 text-center" style={{ color: textSecondary }}>No recent activity.</p>
          ) : (
            (() => {
              const total = activities.length;
              const totalPages = Math.max(1, Math.ceil(total / auditPageSize));
              const safePage = Math.min(Math.max(1, auditPage), totalPages);
              const start = (safePage - 1) * auditPageSize;
              const end = Math.min(start + auditPageSize, total);
              const paginated = activities.slice(start, end);
              return (
                <>
                  <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                    {paginated.map((log) => {
                      const typeStyle = getActionTypeStyle(log.type);
                      const details = formatActivityDetails(log);
                      return (
                        <div key={log._id} className="p-5 hover:bg-opacity-50 transition-all">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ backgroundColor: typeStyle.bg }}
                            >
                              {typeStyle.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold" style={{ color: textPrimary }}>{log.action}</h3>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                                >
                                  {log.type}
                                </span>
                              </div>
                              <p style={{ color: textSecondary }}>
                                <span className="font-medium">{log.userId?.name ?? "—"}</span>
                                {details ? ` · ${details}` : ""}
                              </p>
                            </div>
                            <p className="text-sm flex-shrink-0" style={{ color: textSecondary }}>{formatActivityTime(log.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 p-4"
                    style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm" style={{ color: textSecondary }}>
                        Showing {total === 0 ? 0 : start + 1}–{end} of {total}
                      </span>
                      <select
                        value={auditPageSize}
                        onChange={(e) => {
                          setAuditPageSize(Number(e.target.value));
                          setAuditPage(1);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary, border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                      >
                        {[10, 20, 50].map((n) => (
                          <option key={n} value={n}>{n} per page</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                      >
                        ← Prev
                      </button>
                      <span className="text-sm px-2" style={{ color: textSecondary }}>
                        Page {safePage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setAuditPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              );
            })()
          )}
        </div>
      )}

      {/* Leave Policies Tab */}
      {activeTab === "policies" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Leave Policies</h2>
            <button
              onClick={() => openModal("policy")}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: navyBlue }}
            >
              + Add Policy
            </button>
          </div>
          {policyError && (
            <div className="mx-6 mt-4 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
              <span>{policyError}</span>
              <button onClick={fetchPolicies} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ backgroundColor: "#fecaca" }}>Retry</button>
            </div>
          )}
          <div className="overflow-x-auto">
            {policyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: navyBlue }} />
                <span className="ml-3" style={{ color: textSecondary }}>Loading leave policies…</span>
              </div>
            ) : policies.length === 0 ? (
              <p className="p-12 text-center" style={{ color: textSecondary }}>No leave policies yet. Add one to get started.</p>
            ) : (
              <table className="w-full">
                <thead style={{ backgroundColor: isDark ? "#334155" : "#f8fafc" }}>
                  <tr>
                    {["Leave Type", "Total Days", "Carry Over", "Max Consecutive", "Notice (Days)", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase" style={{ color: textSecondary }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy._id} style={{ borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                      <td className="px-6 py-4 font-medium" style={{ color: textPrimary }}>
                        {(policy.leaveType || "").charAt(0).toUpperCase() + (policy.leaveType || "").slice(1)}
                      </td>
                      <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.totalDays ?? 0}</td>
                      <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.carryOver ?? 0}</td>
                      <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.maxConsecutiveDays ?? 0}</td>
                      <td className="px-6 py-4" style={{ color: textPrimary }}>{policy.noticePeriodDays ?? 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("policy", policy)}
                            className="px-3 py-1 rounded-lg text-sm font-medium"
                            style={{ backgroundColor: `${navyBlue}15`, color: navyBlue }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePolicy(policy._id)}
                            className="px-3 py-1 rounded-lg text-sm font-medium"
                            style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div className="animate-fade-in-up" style={cardStyle}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Departments</h2>
            <button
              onClick={() => openModal('department')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: navyBlue }}
            >
              + Add Department
            </button>
          </div>
          <div className="p-6">
            {deptLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: navyBlue }} />
                <span className="ml-3" style={{ color: textSecondary }}>Loading departments…</span>
              </div>
            ) : deptError ? (
              <div className="text-center py-12">
                <p className="font-medium mb-2" style={{ color: textPrimary }}>{deptError}</p>
                <button
                  onClick={fetchDepartments}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: navyBlue }}
                >
                  Retry
                </button>
              </div>
            ) : departments.length === 0 ? (
              <p className="text-center py-12" style={{ color: textSecondary }}>No departments yet. Add one to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept._id}
                    className="p-5 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg" style={{ color: textPrimary }}>{dept.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('department', dept)}
                          className="text-sm font-medium"
                          style={{ color: navyBlue }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept._id)}
                          className="text-sm font-medium"
                          style={{ color: "#dc2626" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p style={{ color: textSecondary }}>Code: <span style={{ color: textPrimary }}>{dept.code}</span></p>
                      {dept.description && (
                        <p style={{ color: textSecondary }}>{dept.description}</p>
                      )}
                      {dept.isActive === false && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Inactive</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Quotes Tab */}
      {activeTab === "quotes" && (
        <div className="space-y-4 animate-fade-in-up">
          {quoteError && (
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
              <span>{quoteError}</span>
              <button onClick={fetchQuotes} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ backgroundColor: "#fecaca" }}>Retry</button>
            </div>
          )}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>💬 Add Quote</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Quote</label>
                <textarea
                  rows={3}
                  value={quoteForm.text}
                  onChange={(e) => setQuoteForm({ ...quoteForm, text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  placeholder="Enter an inspiring quote..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Author</label>
                  <input
                    type="text"
                    value={quoteForm.authorName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, authorName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Publish Date</label>
                  <input
                    type="date"
                    value={quoteForm.publishDate}
                    onChange={(e) => setQuoteForm({ ...quoteForm, publishDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>
              <button
                onClick={handleCreateQuote}
                disabled={quoteSaving || !quoteForm.text?.trim() || !quoteForm.authorName?.trim() || !quoteForm.publishDate}
                className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: navyBlue }}
              >
                {quoteSaving ? "Creating…" : "➕ Create Quote"}
              </button>
            </div>
          </div>

          <div className="p-6" style={cardStyle}>
            <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Quotes</h3>
            {quoteLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: navyBlue }} />
                <span className="ml-3" style={{ color: textSecondary }}>Loading quotes…</span>
              </div>
            ) : quotes.length === 0 ? (
              <p className="text-center py-12" style={{ color: textSecondary }}>No quotes yet. Create one above.</p>
            ) : (
              <div className="space-y-4">
                {quotes.sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0)).map((q) => {
                  const statusStyle = getQuoteStatusStyle(q.status);
                  return (
                    <div
                      key={q._id}
                      className="p-5 rounded-xl transition-all"
                      style={{
                        backgroundColor: isDark ? "#334155" : "#f8fafc",
                        border: q.status === "published" ? `2px solid ${navyBlue}` : `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <blockquote className="text-lg italic mb-2" style={{ color: textPrimary }}>
                        "{q.text}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <p className="font-medium" style={{ color: navyBlue }}>— {q.authorName}</p>
                        <p className="text-sm" style={{ color: textSecondary }}>
                          📅 {q.publishDate ? new Date(q.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4 animate-fade-in-up">
          {announcementError && (
            <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
              <span>{announcementError}</span>
              <button onClick={fetchAnnouncements} className="px-3 py-1 rounded-lg text-sm font-medium" style={{ backgroundColor: "#fecaca" }}>Retry</button>
            </div>
          )}
          <div className="p-6" style={cardStyle}>
            <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Create Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Message</label>
                <textarea
                  rows={4}
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                  placeholder="Write your announcement..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Audience</label>
                  <select
                    value={announcementForm.audienceType}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, audienceType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                  >
                    <option value="all">All Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Expires At (optional)</label>
                <input
                  type="date"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementForm.isPinned}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                  className="rounded"
                />
                <span style={{ color: textPrimary }}>Pin announcement</span>
              </label>
              <button
                onClick={handleCreateAnnouncement}
                disabled={announcementSaving || !announcementForm.title?.trim() || !announcementForm.message?.trim()}
                className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: navyBlue }}
              >
                {announcementSaving ? "Publishing…" : "📢 Publish Announcement"}
              </button>
            </div>
          </div>

          <div className="p-6" style={cardStyle}>
            <h3 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Announcements</h3>
            {announcementLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: navyBlue }} />
                <span className="ml-3" style={{ color: textSecondary }}>Loading…</span>
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-center py-12" style={{ color: textSecondary }}>No announcements yet. Create one above.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann._id}
                    className="p-4 rounded-xl flex items-center justify-between flex-wrap gap-2"
                    style={{ backgroundColor: isDark ? "#334155" : "#f8fafc" }}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium" style={{ color: textPrimary }}>{ann.title}</h4>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: textSecondary }}>{ann.message}</p>
                      <p className="text-xs mt-1" style={{ color: textSecondary }}>
                        {ann.createdBy?.name && `By ${ann.createdBy.name}`}
                        {ann.expiresAt && ` • Expires ${new Date(ann.expiresAt).toLocaleDateString("en-US")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ann.isPinned && <span className="text-amber-500" title="Pinned">📌</span>}
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: ann.priority === "high" ? "#fee2e2" : ann.priority === "normal" ? "#dcfce7" : "#f1f5f9",
                          color: ann.priority === "high" ? "#dc2626" : ann.priority === "normal" ? "#16a34a" : "#64748b",
                        }}
                      >
                        {ann.priority || "normal"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md p-6 animate-scale-in" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: textPrimary }}>
                {editItem ? "Edit" : "Add"} {modalType === "policy" ? "Leave Policy" : "Department"}
              </h2>
            </div>

            {modalType === "policy" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Leave Type</label>
                  <input
                    type="text"
                    value={policyForm.leaveType}
                    onChange={(e) => setPolicyForm({ ...policyForm, leaveType: e.target.value })}
                    placeholder="e.g. casual, sick, vacation, unpaid"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Total Days</label>
                    <input
                      type="number"
                      min={0}
                      value={policyForm.totalDays}
                      onChange={(e) => setPolicyForm({ ...policyForm, totalDays: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Carry Over</label>
                    <input
                      type="number"
                      min={0}
                      value={policyForm.carryOver}
                      onChange={(e) => setPolicyForm({ ...policyForm, carryOver: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Max Consecutive Days</label>
                    <input
                      type="number"
                      min={0}
                      value={policyForm.maxConsecutiveDays}
                      onChange={(e) => setPolicyForm({ ...policyForm, maxConsecutiveDays: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Notice (Days)</label>
                    <input
                      type="number"
                      min={0}
                      value={policyForm.noticePeriodDays}
                      onChange={(e) => setPolicyForm({ ...policyForm, noticePeriodDays: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{ backgroundColor: isDark ? "#334155" : "#f8fafc", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, color: textPrimary }}
                    />
                  </div>
                </div>
              </div>
            )}

            {modalType === 'department' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Department Name</label>
                  <input
                    type="text"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Code</label>
                  <input
                    type="text"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ENG"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textPrimary }}>Description (optional)</label>
                  <textarea
                    rows={3}
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    placeholder="Brief description of the department"
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ backgroundColor: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, color: textPrimary }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{ backgroundColor: isDark ? "#334155" : "#f1f5f9", color: textPrimary }}>Cancel</button>
              <button
                onClick={
                  modalType === "department"
                    ? handleSaveDepartment
                    : modalType === "policy"
                    ? handleSavePolicy
                    : () => setShowModal(false)
                }
                disabled={
                  (modalType === "department" && (deptSaving || !deptForm.name?.trim() || !deptForm.code?.trim())) ||
                  (modalType === "policy" && (policySaving || !policyForm.leaveType?.trim()))
                }
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: navyBlue }}
              >
                {modalType === "department" && deptSaving
                  ? "Saving…"
                  : modalType === "policy" && policySaving
                  ? "Saving…"
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
