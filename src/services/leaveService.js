import api from './api';

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
