import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getAllOnboardings, managerApproveOnboarding, bgvApproveOnboarding, bgvRejectOnboarding } from "../../services/onboardingServices";

// Combined mock data from both TeamManagement and UserManagement


const departments = ["All", "Engineering", "DevOps", "QA", "Sales", "Product", "Finance", "HR", "Marketing"];
const statusOptions = ["All", "Active", "Pending", "On Leave"];

const mockManagers = [
  { id: "MGR001", name: "Ravi Sharma", dept: "HR" },
  { id: "MGR002", name: "Priya Verma", dept: "Engineering" },
  { id: "MGR003", name: "Suresh Reddy", dept: "Finance" },
  { id: "MGR004", name: "Anita Patel", dept: "Marketing" },
];

const ITEMS_PER_PAGE = 10;

export default function TeamUserManagement() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);
  const [approvalComments, setApprovalComments] = useState("");
  
  // BGV Modal states
  const [showBGVModal, setShowBGVModal] = useState(false);
  const [bgvAction, setBGVAction] = useState(""); // "approve" or "reject"
  const [bgvRemarks, setBGVRemarks] = useState("");
  const [isSavingBGV, setIsSavingBGV] = useState(false);
  const [bgvError, setBGVError] = useState(null);

  // Map API response to component format
  const mapOnboardingToMember = (onboarding) => {
    // Determine document status
    const documentStatus = {
      resume: onboarding.resumeUrl ? "verified" : "pending",
      offerLetter: onboarding.offerLetterUrl ? "verified" : "pending",
      salaryBreakup: onboarding.salaryBreakupUrl ? "verified" : "pending",
    };

    // Map onboarding status
    let onboardingStatus = "created";
    if (onboarding.status === "onboarded") {
      onboardingStatus = "completed";
    } else if (onboarding.status === "docs_pending") {
      onboardingStatus = "documents_pending";
    } else if (onboarding.status === "rejected") {
      onboardingStatus = "rejected";
    }

    // Map BGV status - API returns "pending" or "verified"
    let bgvStatusDisplay = "pending";
    if (onboarding.bgvStatus === "verified") {
      bgvStatusDisplay = "completed";
    } else if (onboarding.bgvStatus === "in_progress") {
      bgvStatusDisplay = "in_progress";
    } else if (onboarding.bgvStatus === "pending" || !onboarding.bgvStatus) {
      bgvStatusDisplay = "pending";
    }

    // Map overall status
    let statusDisplay = "Pending";
    if (onboarding.managerApproval === "rejected") {
      statusDisplay = "Rejected";
    } else if (onboarding.managerApproval === "approved" && onboarding.status === "onboarded") {
      statusDisplay = "Active";
    } else if (onboarding.managerApproval === "approved") {
      statusDisplay = "Pending";
    } else {
      statusDisplay = "Pending";
    }

    return {
      id: onboarding.userId || onboarding._id,
      _id: onboarding._id,
      name: onboarding.candidateName,
      candidateName: onboarding.candidateName,
      email: onboarding.personalEmail || `${onboarding.candidateName?.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      personalEmail: onboarding.personalEmail,
      phoneCode: "+91", // Default, can be extracted if available in API
      phone: onboarding.phone,
      role: onboarding.userId ? "employee" : "pending",
      jobTitle: onboarding.jobDetails?.jobTitle || "",
      dept: onboarding.jobDetails?.department || "",
      department: onboarding.jobDetails?.department || "",
      designation: onboarding.jobDetails?.designation || "",
      status: statusDisplay,
      attendance: "0%",
      leaves: 0,
      joinDate: onboarding.jobDetails?.proposedJoiningDate 
        ? new Date(onboarding.jobDetails.proposedJoiningDate).toISOString().split('T')[0]
        : "",
      onboardingStatus: onboardingStatus,
      documentStatus: documentStatus,
      bgvStatus: bgvStatusDisplay,
      bgvStatusRaw: onboarding.bgvStatus, // Keep original API value for reference
      managerId: null, // Can be added if available in API
      managerApproval: onboarding.managerApproval,
      managerComments: onboarding.managerComments,
      bgvRemarks: onboarding.bgvRemarks,
      finalApproval: onboarding.finalApproval,
      finalComments: onboarding.finalComments,
      createdAt: onboarding.createdAt,
      updatedAt: onboarding.updatedAt,
      // Address info
      addressInfo: onboarding.addressInfo,
      // Additional fields for view/edit modals
      dateOfBirth: onboarding.additionalInfo?.dateOfBirth || "",
      gender: onboarding.additionalInfo?.gender || "",
      bloodGroup: onboarding.additionalInfo?.bloodGroup || "",
      emergencyContactName: onboarding.additionalInfo?.emergencyContact?.name || "",
      emergencyContactRelation: onboarding.additionalInfo?.emergencyContact?.relation || "",
      emergencyContactPhone: onboarding.additionalInfo?.emergencyContact?.phone || "",
      emergencyPhoneCode: onboarding.additionalInfo?.emergencyContact?.phoneCode || "+91",
    };
  };

  // Fetch onboarding data from API
  useEffect(() => {
    const fetchOnboardings = async () => {
      setIsLoading(true);
      try {
        const response = await getAllOnboardings();
        console.log("Onboarding API response:", response);
        
        if (response.onboardingList && Array.isArray(response.onboardingList)) {
          const mappedMembers = response.onboardingList.map(mapOnboardingToMember);
          setMembers(mappedMembers);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error("Error fetching onboardings:", error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardings();
  }, []);

  const navyBlue = '#1e3a5f';
  const cardStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '16px',
  };
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const defaultBorderColor = isDark ? '#475569' : '#e2e8f0';
  const inputStyle = {
    backgroundColor: isDark ? '#334155' : '#f8fafc',
    border: `1px solid ${defaultBorderColor}`,
    color: textPrimary
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.name || member.candidateName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === "All" || (member.department || member.dept) === filterDept;
    const matchesStatus = filterStatus === "All" || member.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = () => setCurrentPage(1);

  // Handlers
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember({ ...member });
    setApprovalComments(member.managerComments || "");
    setShowEditModal(true);
    setEditError(null);
  };

  const handleBGVAction = (member, action) => {
    setSelectedMember({ ...member });
    setBGVAction(action);
    setBGVRemarks(member.bgvRemarks || "");
    setShowBGVModal(true);
    setBGVError(null);
  };

  const handleSaveBGV = async () => {
    if (!selectedMember || !selectedMember._id) {
      alert("Error: Missing employee ID.");
      return;
    }

    if (!bgvRemarks.trim()) {
      setBGVError("Remarks are required");
      return;
    }

    setIsSavingBGV(true);
    setBGVError(null);

    try {
      console.log("=== Saving BGV Action ===");
      console.log("Onboarding ID:", selectedMember._id);
      console.log("Action:", bgvAction);
      console.log("Remarks:", bgvRemarks.trim());

      if (bgvAction === "approve") {
        const bgvData = { remarks: bgvRemarks.trim() };
        console.log("BGV Approve Data:", bgvData);
        await bgvApproveOnboarding(selectedMember._id, bgvData);
      } else {
        // For reject, use "reject" as parameter name
        const bgvData = { remarks: bgvRemarks.trim() };
        console.log("BGV Reject Data:", bgvData);
        await bgvRejectOnboarding(selectedMember._id, bgvData);
      }

      // Refresh data from API
      const response = await getAllOnboardings();
      if (response.onboardingList && Array.isArray(response.onboardingList)) {
        const mappedMembers = response.onboardingList.map(mapOnboardingToMember);
        setMembers(mappedMembers);
      }

      setShowBGVModal(false);
      setBGVRemarks("");
      alert(`BGV ${bgvAction === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error saving BGV action:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update BGV status. Please try again.';
      setBGVError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSavingBGV(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMember || !selectedMember._id) {
      console.error("Cannot save: Missing onboarding ID");
      alert("Error: Cannot save changes. Missing employee ID.");
      return;
    }

    // Determine action based on managerApproval status
    const action = selectedMember.managerApproval === "rejected" ? "rejected" : "approved";

    setIsSavingEdit(true);
    setEditError(null);

    try {
      // Prepare approval data according to API
      const approvalData = {
        action: action,
        comments: approvalComments.trim() || ""
      };

      console.log("=== Saving Manager Approval ===");
      console.log("Onboarding ID:", selectedMember._id);
      console.log("Approval Data:", approvalData);

      // Call manager approval API
      await managerApproveOnboarding(selectedMember._id, approvalData);

      // Refresh data from API to ensure consistency
      const response = await getAllOnboardings();
      if (response.onboardingList && Array.isArray(response.onboardingList)) {
        const mappedMembers = response.onboardingList.map(mapOnboardingToMember);
        setMembers(mappedMembers);
      }

      setShowEditModal(false);
      setApprovalComments("");
      alert(`Employee ${action === "approved" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error saving approval:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update employee approval. Please try again.';
      setEditError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSavingEdit(false);
    }
  };


  const handleUpdateStatus = (memberId, field, value) => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        if (field === 'documentStatus') {
          return { ...m, documentStatus: { ...m.documentStatus, ...value } };
        } else if (field === 'bgvStatus') {
          return { ...m, bgvStatus: value };
        } else if (field === 'status') {
          return { ...m, status: value };
        } else if (field === 'onboardingStatus') {
          return { ...m, onboardingStatus: value };
        }
      }
      return m;
    }));
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember({ ...selectedMember, [field]: value });
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      active: { bg: "#dcfce7", color: "#16a34a", label: "Active" },
      pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
      "on leave": { bg: "#dbeafe", color: "#2563eb", label: "On Leave" },
      "On Leave": { bg: "#dbeafe", color: "#2563eb", label: "On Leave" },
    };
    return styles[status?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
  };

  const getOnboardingStyle = (status) => {
    const styles = {
      completed: { bg: "#dcfce7", color: "#16a34a", label: "Onboarded" },
      documents_pending: { bg: "#fef3c7", color: "#d97706", label: "Docs Pending" },
      bgv_in_progress: { bg: "#dbeafe", color: "#2563eb", label: "BGV In Progress" },
    };
    return styles[status] || { bg: "#f1f5f9", color: "#64748b", label: status || "Unknown" };
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "verified": return { bg: "#dcfce7", color: "#16a34a", icon: "✓" };
      case "pending": return { bg: "#fef3c7", color: "#d97706", icon: "⏳" };
      case "rejected": return { bg: "#fee2e2", color: "#dc2626", icon: "✗" };
      default: return { bg: "#f1f5f9", color: "#64748b", icon: "?" };
    }
  };

  // Combined stats
  const stats = [
    { label: "Total Members", value: members.length, color: "#2563eb", icon: "👥" },
    { label: "Active", value: members.filter(m => m.status === "Active" || m.status === "active").length, color: "#16a34a", icon: "✅" },
    { label: "Pending", value: members.filter(m => m.status === "Pending" || m.status === "pending").length, color: "#d97706", icon: "⏳" },
    { label: "BGV Pending", value: members.filter(m => m.bgvStatus === "pending" || m.bgvStatus === "in_progress").length, color: "#7c3aed", icon: "🔍" },
  ];

  const getManagerName = (managerId) => {
    const manager = mockManagers.find(m => m.id === managerId);
    return manager ? manager.name : "Not Assigned";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>Onboarding Employees</h1>
        <p className="text-sm sm:text-base" style={{ color: textSecondary }}>Manage employees and track information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {stats.map((stat, index) => (
          <div key={index} className="p-5 hover-lift" style={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: textSecondary }} className="text-sm font-medium">{stat.label}</p>
                <p style={{ color: textPrimary }} className="text-3xl font-bold mt-1">{isLoading ? "..." : stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${stat.color}20` }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center animate-fade-in-up" style={cardStyle}>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: navyBlue }}></div>
          <p style={{ color: textSecondary }} className="mt-4">Loading user data...</p>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 animate-fade-in-up" style={cardStyle}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
              style={inputStyle}
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); handleFilterChange(); }}
            className="px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
          >
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: textSecondary }}>
            Showing {paginatedMembers.length} of {filteredMembers.length} members
          </span>
        </div>
      </div>

      {/* Members List */}
      <div style={cardStyle} className="overflow-hidden animate-fade-in-up">
        <div 
          className="p-5"
          style={{ 
            background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)`,
          }}
        >
          <h2 className="text-lg font-bold text-white">Onboarding Employees</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: navyBlue }}></div>
            <p style={{ color: textSecondary }}>Loading user data...</p>
          </div>
        ) : paginatedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-5xl block mb-4">👥</span>
            <p className="font-semibold" style={{ color: textPrimary }}>No members found</p>
            <p className="text-sm" style={{ color: textSecondary }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
            {paginatedMembers.map((member) => {
              const statusStyle = getStatusStyle(member.status);
              const onboardingStyle = getOnboardingStyle(member.onboardingStatus);
              const memberName = member.name || member.candidateName;
              const memberDept = member.department || member.dept;
              const memberJobTitle = member.jobTitle || member.designation;
              
              return (
                <div 
                  key={member.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-opacity-50 transition-all"
                  style={{ backgroundColor: isDark ? 'transparent' : 'transparent' }}
                >
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                      style={{ backgroundColor: `${navyBlue}20`, color: navyBlue }}
                    >
                      {memberName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: textPrimary }}>{memberName}</p>
                      <p className="text-sm truncate" style={{ color: textSecondary }}>
                        {memberJobTitle} • {memberDept}
                      </p>
                      {/* <p className="text-xs" style={{ color: textSecondary }}>ID: {member.id}</p> */}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                    {member.onboardingStatus && (
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: onboardingStyle.bg, color: onboardingStyle.color }}
                      >
                        {onboardingStyle.label}
                      </span>
                    )}
                    {/* {member.attendance && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textSecondary }}>
                        📊 {member.attendance}
                      </span>
                    )} */}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewMember(member)}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}
        >
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: textSecondary }}>
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6 sticky top-0"
              style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #2563eb 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMember.name || selectedMember.candidateName}</h2>
                    <p className="text-blue-200 text-sm">{selectedMember.jobTitle || selectedMember.designation} • {selectedMember.department || selectedMember.dept}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[calc(90vh-120px)] overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? '#475569 #1e293b' : '#cbd5e1 #ffffff'
            }}>
              {/* Personal Information Section */}
              <div className="space-y-3">
                <h3 className="text-base font-bold pb-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  👤 Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>📧 Email</p>
                    <p className="font-semibold text-xs break-all" style={{ color: textPrimary }}>
                      {selectedMember.email || selectedMember.personalEmail || selectedMember.companyEmail || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>📞 Phone</p>
                    <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                      {selectedMember.phoneCode ? `${selectedMember.phoneCode} ` : ""}{selectedMember.phone || selectedMember.phoneNumber || "N/A"}
                    </p>
                  </div>
                  {selectedMember.employeeId && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>🆔 Employee ID</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                        {selectedMember.employeeId}
                      </p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>📅 Join Date</p>
                    <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                      {selectedMember.joinDate || selectedMember.joiningDate || selectedMember.proposedJoiningDate || "N/A"}
                    </p>
                  </div>
                  {selectedMember.address && (
                    <div className="p-3 rounded-lg md:col-span-2" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>📍 Address</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                        {selectedMember.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Information Section */}
              <div className="space-y-3">
                <h3 className="text-base font-bold pb-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  💼 Job Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>🏢 Department</p>
                    <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                      {selectedMember.department || selectedMember.dept || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>💼 Designation</p>
                    <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                      {selectedMember.jobTitle || selectedMember.designation || "N/A"}
                    </p>
                  </div>
                  {selectedMember.jobLevel && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>📊 Job Level</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                        {selectedMember.jobLevel}
                      </p>
                    </div>
                  )}
                  {selectedMember.jobType && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: textSecondary }}>⏰ Job Type</p>
                      <p className="font-semibold text-xs" style={{ color: textPrimary }}>
                        {selectedMember.jobType}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <h3 className="text-base font-bold pb-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                  📊 Status Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* BGV Status */}
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>🔍 BGV Status</p>
                    <span 
                      className="px-3 py-1.5 rounded-full text-xs font-bold inline-block"
                      style={{ 
                        backgroundColor: selectedMember.bgvStatus === 'completed' ? '#dcfce7' : '#dbeafe',
                        color: selectedMember.bgvStatus === 'completed' ? '#16a34a' : '#2563eb'
                      }}
                    >
                      {selectedMember.bgvStatus === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                    </span>
                  </div>

                  {/* Onboarding Status */}
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: textSecondary }}>📋 Onboarding</p>
                    <span 
                      className="px-3 py-1.5 rounded-full text-xs font-bold inline-block"
                      style={{ 
                        backgroundColor: getOnboardingStyle(selectedMember.onboardingStatus || selectedMember.status).bg,
                        color: getOnboardingStyle(selectedMember.onboardingStatus || selectedMember.status).color
                      }}
                    >
                      {getOnboardingStyle(selectedMember.onboardingStatus || selectedMember.status).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Status */}
              {selectedMember.documentStatus && Object.keys(selectedMember.documentStatus).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold pb-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                    📁 Document Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(selectedMember.documentStatus).map(([doc, status]) => {
                      const docStyle = getDocStatusStyle(status);
                      return (
                        <div 
                          key={doc} 
                          className="p-2.5 rounded-lg text-center" 
                          style={{ backgroundColor: docStyle.bg }}
                        >
                          <p className="text-xs font-semibold capitalize mb-1" style={{ color: docStyle.color }}>
                            {docStyle.icon} {doc.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs font-medium" style={{ color: docStyle.color }}>
                            {status === 'verified' ? '✓ Verified' : status === 'pending' ? '⏳ Pending' : status}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BGV Remarks */}
              {selectedMember.bgvRemarks && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold pb-2 border-b" style={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textPrimary }}>
                    💬 BGV Remarks
                  </h3>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                    <p className="text-xs leading-relaxed" style={{ color: textPrimary }}>{selectedMember.bgvRemarks}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-2" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                {/* BGV Action Buttons */}
                {selectedMember.bgvStatus !== "completed" && selectedMember.bgvStatus !== "verified" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setShowViewModal(false); handleBGVAction(selectedMember, "approve"); }}
                      className="py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: '#dcfce7', 
                        color: '#16a34a',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
                      }}
                    >
                      ✅ BGV Approve
                    </button>
                    <button
                      onClick={() => { setShowViewModal(false); handleBGVAction(selectedMember, "reject"); }}
                      className="py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                      style={{ 
                        backgroundColor: '#fee2e2', 
                        color: '#dc2626',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
                      }}
                    >
                      ❌ BGV Reject
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: isDark ? '#334155' : '#f1f5f9', 
                    color: textPrimary 
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-2xl animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ background: `linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ✏️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Manager Approval</h2>
                    <p className="text-purple-200 text-sm">Approve or reject employee onboarding</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Manager Approval Status */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Manager Approval</label>
                <select
                  value={selectedMember.managerApproval || "pending"}
                  onChange={(e) => {
                    const approvalValue = e.target.value;
                    setSelectedMember({ 
                      ...selectedMember, 
                      managerApproval: approvalValue,
                      status: approvalValue === "approved" ? "Approved" : approvalValue === "rejected" ? "Rejected" : "Pending"
                    });
                  }}
                  className="w-full px-4 py-4 rounded-xl outline-none"
                  style={inputStyle}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Comments Field */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>Comments</label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={inputStyle}
                  placeholder="Enter comments for approval/rejection (e.g., 'Looks good, proceed.')"
                />
              </div>

            
              {/* Error Message */}
              {editError && (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium" style={{ color: '#dc2626' }}>{editError}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSavingEdit}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                  }}
                >
                  {isSavingEdit ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BGV Approval/Rejection Modal */}
      {showBGVModal && selectedMember && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in p-4"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="w-full max-w-2xl animate-scale-in"
            style={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              className="p-6"
              style={{ 
                background: bgvAction === "approve" 
                  ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    {bgvAction === "approve" ? "✅" : "❌"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      BGV {bgvAction === "approve" ? "Approve" : "Reject"}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {bgvAction === "approve" 
                        ? "Approve background verification for this employee" 
                        : "Reject background verification for this employee"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Employee Info */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? '#334155' : '#f8fafc' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: textSecondary }}>Employee</p>
                <p className="font-bold" style={{ color: textPrimary }}>
                  {selectedMember.candidateName || selectedMember.name}
                </p>
                <p className="text-sm" style={{ color: textSecondary }}>
                  {selectedMember.personalEmail || selectedMember.email}
                </p>
              </div>

              {/* Remarks Field */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: textPrimary }}>
                  Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bgvRemarks}
                  onChange={(e) => setBGVRemarks(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all focus:ring-2"
                  style={{ 
                    ...inputStyle,
                    focusRingColor: bgvAction === "approve" ? '#16a34a' : '#dc2626'
                  }}
                  placeholder={bgvAction === "approve" 
                    ? "Enter remarks for BGV approval (e.g., 'Done', 'All documents verified')" 
                    : "Enter reason for BGV rejection (e.g., 'Document verification failed', 'Background check incomplete')"}
                />
              </div>

              {/* Error Message */}
              {bgvError && (
                <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium" style={{ color: '#dc2626' }}>{bgvError}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <button
                  onClick={() => {
                    setShowBGVModal(false);
                    setBGVRemarks("");
                    setBGVError(null);
                  }}
                  disabled={isSavingBGV}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', color: textPrimary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBGV}
                  disabled={isSavingBGV || !bgvRemarks.trim()}
                  className="flex-1 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: bgvAction === "approve"
                      ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                      : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    boxShadow: bgvAction === "approve"
                      ? '0 4px 15px rgba(22, 163, 74, 0.4)'
                      : '0 4px 15px rgba(220, 38, 38, 0.4)'
                  }}
                >
                  {isSavingBGV ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {bgvAction === "approve" ? "Approving..." : "Rejecting..."}
                    </span>
                  ) : (
                    `${bgvAction === "approve" ? "✅ Approve" : "❌ Reject"} BGV`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
