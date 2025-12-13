import api from './api'

/**
 * Fetch all employees/users for directory
 * @returns {Promise} API response with users array
 */
export async function fetchEmployees() {
  try {
    const response = await api.get('/users');
    console.log("Directory API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

/**
 * Fetch a single employee by ID
 * @param {string} id - Employee ID
 * @returns {Promise} API response with user data
 */
export async function fetchEmployee(id) {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
}
