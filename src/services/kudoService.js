import api from './api'

/**
 * Fetch all kudos
 * @returns {Promise} API response with kudos array
 */
export async function fetchKudos() {
    try {
        const response = await api.get('/kudos');
        return response.data;
    } catch (error) {
        console.error('Error fetching kudos:', error);
        throw error;
    }
}

/**
 * Post a new kudo
 * @param {Object} kudoData - Data for the new kudo
 * @returns {Promise} API response
 */
export async function postKudo(kudoData) {
    try {
        const response = await api.post('/kudos', kudoData);
        return response.data;
    } catch (error) {
        console.error('Error posting kudo:', error);
        throw error;
    }
}

/**
 * Like or unlike a kudo
 * @param {string} kudoId - ID of the kudo to like
 * @param {boolean} liked - Whether the user is liking or unliking
 * @returns {Promise} API response
 */
export async function likeKudo(kudoId, liked) {
    try {
        const response = await api.post(`/kudos/${kudoId}/like`, { liked });
        return response.data;
    } catch (error) {
        console.error('Error liking kudo:', error);
        throw error;
    }
}

/**
 * Comment on a kudo
 * @param {string} kudoId - ID of the kudo to comment on
 * @param {string} comment - The comment message
 * @returns {Promise} API response
 */
export async function commentOnKudo(kudoId, comment) {
    try {
        const response = await api.post(`/kudos/${kudoId}/comment`, { comment });
        return response.data;
    } catch (error) {
        console.error('Error commenting on kudo:', error);
        throw error;
    }
}
