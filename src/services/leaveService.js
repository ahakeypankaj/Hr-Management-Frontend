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
  
  if (leaveData.attachment) {
    formData.append('attachment', leaveData.attachment);
  }

  // The api interceptor will handle Authorization header
  // For FormData, browser will automatically set Content-Type with boundary
  return api.post('/api/leave/apply-leave', formData);
}
