import api from './api'

/**
 * Check-in for attendance
 * @param {boolean} checkInTrigger - Check-in trigger flag (should be true)
 * @returns {Promise} API response
 */
export async function checkIn(checkInTrigger = true) {
  console.log("[Attendance] Check-in triggered:", checkInTrigger);
  return api.post('/attendance/check-in', {
    checkInTrigger: checkInTrigger
  });
}

/**
 * Check-out for attendance
 * @param {boolean} checkOutTrigger - Check-out trigger flag (should be true)
 * @returns {Promise} API response
 */
export async function checkOut(checkOutTrigger = true) {
  console.log("[Attendance] Check-out triggered:", checkOutTrigger);
  return api.post('/attendance/check-out', {
    checkOutTrigger: checkOutTrigger
  });
}

/**
 * Get today's attendance status for the current user
 * @returns {Promise} API response with today's attendance data
 */
export async function getTodayAttendance() {
  console.log("[Attendance] Fetching today's attendance");
  return api.get('/attendance/getTodayAttendance');
}

/**
 * Get attendance history for the current user
 * @returns {Promise} API response with attendance history
 */
export async function getAttendanceHistory() {
  console.log("[Attendance] Fetching attendance history");
  return api.get('/attendance/history');
}

export async function recordAttendance(payload) {
  console.log("[Attendance] Recording attendance payload:", payload);
  return { data: payload }
}

export async function fetchAttendance(userId) {
  console.log("[Attendance] Fetch attendance for userId:", userId);
  return []
}

/**
 * Get attendance dashboard data for HR/Admin
 * @returns {Promise} API response with summary and table data
 */
export async function getAttendanceDashboard() {
  console.log("[Attendance] Fetching attendance dashboard");
  try {
    const response = await api.get('/attendance/getAttendanceDashboard');
    console.log("[Attendance] Dashboard response:", response.data);
    return response.data;
  } catch (error) {
    console.error('[Attendance] Error fetching dashboard:', error);
    throw error;
  }
}
