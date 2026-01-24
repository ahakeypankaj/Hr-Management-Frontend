import api from './api'

/**
 * Get all announcements
 * @returns {Promise<{ success: boolean, announcements: Array }>}
 */
export async function getAllAnnouncements() {
  try {
    const response = await api.get('/announcement/all')
    return response.data
  } catch (error) {
    console.error('[Announcement] Error fetching announcements:', error)
    throw error
  }
}

/**
 * Get announcement by ID
 * @param {string} id - Announcement _id
 * @returns {Promise<{ success: boolean, announcement: Object }>}
 */
export async function getAnnouncementById(id) {
  try {
    const response = await api.get(`/announcement/${id}`)
    return response.data
  } catch (error) {
    console.error('[Announcement] Error fetching announcement:', error)
    throw error
  }
}

/**
 * Create an announcement
 * @param {Object} payload
 * @param {string} payload.title
 * @param {string} payload.message
 * @param {string} payload.priority - e.g. low, normal, high
 * @param {string} payload.audienceType - e.g. all
 * @param {string} payload.expiresAt - ISO date string
 * @param {boolean} [payload.isPinned]
 * @returns {Promise}
 */
export async function createAnnouncement(payload) {
  try {
    const response = await api.post('/announcement', payload)
    return response.data
  } catch (error) {
    console.error('[Announcement] Error creating announcement:', error)
    throw error
  }
}
