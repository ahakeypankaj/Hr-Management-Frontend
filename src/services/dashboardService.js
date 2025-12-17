import api from './api'

/**
 * Fetch dashboard data for HR/Admin
 * @returns {Promise} API response with dashboard data
 */
export async function fetchDashboardData() {
  try {
    const response = await api.get('/users/dashboard');
    console.log("Dashboard API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
