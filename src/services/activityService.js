import api from './api'

/**
 * Get recent activity for audit logs
 * @returns {Promise<{ success: boolean, data: Array }>}
 */
export async function getRecentActivity() {
  try {
    const response = await api.get('/activity/recent')
    return response.data
  } catch (error) {
    console.error('[Activity] Error fetching recent activity:', error)
    throw error
  }
}
