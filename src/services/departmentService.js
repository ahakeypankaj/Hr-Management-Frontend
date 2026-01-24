import api from './api'

/**
 * Get all departments
 * @returns {Promise<{ success: boolean, departments: Array }>}
 */
export async function getDepartments() {
  try {
    const response = await api.get('/department')
    return response.data
  } catch (error) {
    console.error('[Department] Error fetching departments:', error)
    throw error
  }
}

/**
 * Create a department
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.code
 * @param {string} [payload.description]
 * @returns {Promise}
 */
export async function createDepartment(payload) {
  try {
    const response = await api.post('/department', payload)
    return response.data
  } catch (error) {
    console.error('[Department] Error creating department:', error)
    throw error
  }
}

/**
 * Update a department
 * @param {string} id - Department _id
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.code
 * @param {string} [payload.description]
 * @returns {Promise}
 */
export async function updateDepartment(id, payload) {
  try {
    const response = await api.put(`/department/${id}`, payload)
    return response.data
  } catch (error) {
    console.error('[Department] Error updating department:', error)
    throw error
  }
}

/**
 * Delete a department
 * @param {string} id - Department _id
 * @returns {Promise}
 */
export async function deleteDepartment(id) {
  try {
    const response = await api.delete(`/department/${id}`)
    return response.data
  } catch (error) {
    console.error('[Department] Error deleting department:', error)
    throw error
  }
}
