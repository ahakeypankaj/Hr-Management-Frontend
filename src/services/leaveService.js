import api from './api'

/**
 * Fetch pending leave approvals for HR/Admin
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise} API response with pending leave approvals
 */
export async function getPendingLeaveApprovals(page = 1, limit = 10) {
  try {
    const response = await api.get('/leave/approvals/pending', {
      params: { page, limit }
    });
    console.log("Pending leave approvals API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending leave approvals:', error);
    throw error;
  }
}

/**
 * Approve a leave request
 * @param {string} leaveId - Leave request ID
 * @param {string} comments - Approval comments
 * @returns {Promise} API response
 */
export async function approveLeave(leaveId, comments = "") {
  try {
    const response = await api.patch(`/leave/${leaveId}/approve`, {
      comments: comments
    });
    console.log("Approve leave response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
}

/**
 * Reject a leave request
 * @param {string} leaveId - Leave request ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise} API response
 */
export async function rejectLeave(leaveId, rejectionReason) {
  try {
    const response = await api.patch(`/leave/${leaveId}/reject`, {
      rejectionReason: rejectionReason
    });
    console.log("Reject leave response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
}

/**
 * Apply for leave
 * @param {Object} leaveData - Leave application data
 * @param {string} leaveData.leaveType - Type of leave (casual, sick, annual, etc.)
 * @param {string} leaveData.startDate - Start date in DD-MM-YYYY format
 * @param {string} leaveData.endDate - End date in DD-MM-YYYY format
 * @param {string} leaveData.reason - Reason for leave
 * @param {File} leaveData.attachment - Optional attachment file
 * @returns {Promise} API response
 */
export async function applyLeave(leaveData) {
  const formData = new FormData();
  formData.append('leaveType', leaveData.leaveType);
  formData.append('startDate', leaveData.startDate);
  formData.append('endDate', leaveData.endDate);
  formData.append('reason', leaveData.reason);
  
  console.log("leaveData", leaveData);
  if (leaveData.attachment) {
    formData.append('attachment', leaveData.attachment);
  }

  // The api interceptor will handle Authorization header
  // For FormData, browser will automatically set Content-Type with boundary
  return api.post('/leave/apply-leave', formData);
}

/**
 * Get leave details summary for the current user
 * @returns {Promise} API response with leave balances
 */
export async function getLeaveSummary() {
  return api.get('/leave/details/summary');
}

/**
 * Get leave applications/history for the current user
 * @returns {Promise} API response with leave applications
 */
export async function getMyLeaveApplications() {
  return api.get('/leave/my-applications');
}

/**
 * Get all leave policies
 * @returns {Promise<{ success: boolean, policies: Array }>}
 */
export async function getLeavePolicies() {
  try {
    const response = await api.get('/leave/leave-policy');
    return response.data;
  } catch (error) {
    console.error('[Leave] Error fetching leave policies:', error);
    throw error;
  }
}

/**
 * Create a leave policy
 * @param {Object} payload
 * @param {string} payload.leaveType
 * @param {number} payload.totalDays
 * @param {number} payload.carryOver
 * @param {number} payload.maxConsecutiveDays
 * @param {number} payload.noticePeriodDays
 * @returns {Promise}
 */
export async function createLeavePolicy(payload) {
  try {
    const response = await api.post('/leave/leave-policy', payload);
    return response.data;
  } catch (error) {
    console.error('[Leave] Error creating leave policy:', error);
    throw error;
  }
}

/**
 * Update a leave policy
 * @param {string} id - Policy _id
 * @param {Object} payload - Same as create
 * @returns {Promise}
 */
export async function updateLeavePolicy(id, payload) {
  try {
    const response = await api.put(`/leave/leave-policy/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('[Leave] Error updating leave policy:', error);
    throw error;
  }
}

/**
 * Delete a leave policy
 * @param {string} id - Policy _id
 * @returns {Promise}
 */
export async function deleteLeavePolicy(id) {
  try {
    const response = await api.delete(`/leave/leave-policy/${id}`);
    return response.data;
  } catch (error) {
    console.error('[Leave] Error deleting leave policy:', error);
    throw error;
  }
}

/**
 * Get team leave calendar data
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month 0–11 (0 = January, 11 = December), matches JS Date
 * @returns {Promise} API response with team leave calendar data
 */
export async function getTeamLeaveCalendar(year, month) {
  // API expects month as 1–12 zero-padded (e.g. "01", "02")
  const apiMonth = String(month + 1).padStart(2, '0');
  console.log("[Leave] Fetching team leave calendar:", { year, month: apiMonth });
  try {
    const response = await api.get('/leave/team-calendar', {
      params: { year, month: apiMonth }
    });
    console.log("[Leave] Team calendar response:", response.data);
    return response.data;
  } catch (error) {
    console.error('[Leave] Error fetching team leave calendar:', error);
    throw error;
  }
}
