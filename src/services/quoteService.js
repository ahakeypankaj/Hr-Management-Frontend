import api from './api'

/**
 * Get published quotes (for employee dashboard)
 * @returns {Promise<{ success: boolean, quotes?: Array }>}
 */
export async function getQuotes() {
  try {
    const response = await api.get('/quotes/published')
    return response.data
  } catch (error) {
    console.error('[Quote] Error fetching quotes:', error)
    throw error
  }
}

/**
 * Get all quotes (for Settings)
 * @returns {Promise<{ success: boolean, quotes?: Array }>}
 */
export async function getAllQuotes() {
  try {
    const response = await api.get('/quotes/all')
    return response.data
  } catch (error) {
    console.error('[Quote] Error fetching all quotes:', error)
    throw error
  }
}

/**
 * Get a single quote by ID
 * @param {string} id - Quote _id
 * @returns {Promise<{ success: boolean, quote: Object }>}
 */
export async function getQuote(id) {
  try {
    const response = await api.get(`/quotes/${id}`)
    return response.data
  } catch (error) {
    console.error('[Quote] Error fetching quote:', error)
    throw error
  }
}

/**
 * Create a quote
 * @param {Object} payload
 * @param {string} payload.text
 * @param {string} payload.authorName
 * @param {string} payload.publishDate - YYYY-MM-DD
 * @returns {Promise}
 */
export async function createQuote(payload) {
  try {
    const response = await api.post('/quotes', payload)
    return response.data
  } catch (error) {
    console.error('[Quote] Error creating quote:', error)
    throw error
  }
}
/**
 * Update a quote
 * @param {string} id - Quote _id
 * @param {Object} payload
 * @returns {Promise}
 */
export async function updateQuote(id, payload) {
  try {
    const response = await api.put(`/quotes/${id}`, payload)
    return response.data
  } catch (error) {
    console.error('[Quote] Error updating quote:', error)
    throw error
  }
}

/**
 * Delete a quote
 * @param {string} id - Quote _id
 * @returns {Promise}
 */
export async function deleteQuote(id) {
  try {
    const response = await api.delete(`/quotes/${id}`)
    return response.data
  } catch (error) {
    console.error('[Quote] Error deleting quote:', error)
    throw error
  }
}
