import api from './api'

/**
 * Create a new performance cycle
 * @param {Object} cycleData - Object containing:
 *   - name: string (e.g., "2025-Q1 Review")
 *   - startDate: string (ISO date)
 *   - endDate: string (ISO date)
 *   - stages: Object with dates for goalSetting, selfReview, managerReview, calibration, finalization
 * @returns {Promise} API response
 */
export async function createPerformanceCycle(cycleData) {
  try {
    const response = await api.post('/performance-cycle/create', cycleData);
    return response.data;
  } catch (error) {
    console.error('Error creating performance cycle:', error);
    throw error;
  }
}

/**
 * Assign performance review to an employee
 * @param {Object} assignmentData - Object containing:
 *   - userId: string
 *   - reviewerId: string
 *   - cycleId: string
 *   - goals: array (can be empty initially)
 *   - status: string (e.g., "goal-setting")
 * @returns {Promise} API response
 */
export async function assignPerformance(assignmentData) {
  try {
    const response = await api.post('/performance/assign', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Error assigning performance:', error);
    throw error;
  }
}

/**
 * Set goals for a performance review
 * @param {string} performanceId - The performance review ID
 * @param {Object} goalsData - Object containing:
 *   - goals: array of { title, description, weightage }
 * @returns {Promise} API response
 */
export async function setPerformanceGoals(performanceId, goalsData) {
  try {
    const response = await api.post(`/performance/${performanceId}/goals`, goalsData);
    return response.data;
  } catch (error) {
    console.error('Error setting performance goals:', error);
    throw error;
  }
}

/**
 * Submit self-review for a performance review
 * @param {string} performanceId - The performance review ID
 * @param {Object} reviewData - Object containing:
 *   - goals: array of { selfRating }
 * @returns {Promise} API response
 */
export async function submitSelfReview(performanceId, reviewData) {
  try {
    const response = await api.post(`/performance/${performanceId}/self-review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting self-review:', error);
    throw error;
  }
}

/**
 * Submit manager review for a performance review
 * @param {string} performanceId - The performance review ID
 * @param {Object} reviewData - Object containing:
 *   - goals: array of { managerRating, comments }
 * @returns {Promise} API response
 */
export async function submitManagerReview(performanceId, reviewData) {
  try {
    const response = await api.post(`/performance/${performanceId}/manager-review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting manager review:', error);
    throw error;
  }
}

/**
 * Get team performance data
 * @returns {Promise} API response with team array
 */
export async function getTeamPerformance() {
  try {
    const response = await api.get('/performance/team');
    return response.data;
  } catch (error) {
    console.error('Error fetching team performance:', error);
    throw error;
  }
}

/**
 * Get my performance data
 * @returns {Promise} API response with performance array
 */
export async function getMyPerformance() {
  try {
    const response = await api.get('/performance/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching my performance:', error);
    throw error;
  }
}

/**
 * Add feedback for a performance review
 * @param {Object} feedbackData - Object containing:
 *   - performanceId: string
 *   - comments: string
 *   - rating: number
 * @returns {Promise} API response
 */
export async function addFeedback(feedbackData) {
  try {
    const response = await api.post('/feedback/add', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
}

/**
 * HR calibrate performance review
 * @param {string} performanceId - The performance review ID
 * @param {Object} calibrateData - Object containing:
 *   - overallRating: number
 * @returns {Promise} API response
 */
export async function calibratePerformance(performanceId, calibrateData) {
  try {
    const response = await api.post(`/performance/${performanceId}/calibrate`, calibrateData);
    return response.data;
  } catch (error) {
    console.error('Error calibrating performance:', error);
    throw error;
  }
}

/**
 * HR finalize performance review
 * @param {string} performanceId - The performance review ID
 * @param {Object} finalizeData - Object containing:
 *   - status: string (e.g., "finalized")
 * @returns {Promise} API response
 */
export async function finalizePerformance(performanceId, finalizeData) {
  try {
    const response = await api.post(`/performance/${performanceId}/finalize`, finalizeData);
    return response.data;
  } catch (error) {
    console.error('Error finalizing performance:', error);
    throw error;
  }
}
