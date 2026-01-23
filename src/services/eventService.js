import api from './api'

/**
 * Fetch all events with optional filters
 * @param {Object} params - Filter parameters (type, startDate, endDate, isOptional)
 * @returns {Promise} API response with events array
 */
export async function fetchEvents(params = {}) {
    try {
        const response = await api.get('/events', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

/**
 * Create a new event
 * @param {Object} eventData - Data for the new event
 * @returns {Promise} API response
 */
export async function createEvent(eventData) {
    try {
        const response = await api.post('/events', eventData);
        return response.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}

/**
 * Update an existing event
 * @param {string} eventId - ID of the event to update
 * @param {Object} updateData - Data to update
 * @returns {Promise} API response
 */
export async function updateEvent(eventId, updateData) {
    try {
        const response = await api.put(`/events/${eventId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

/**
 * Delete an event
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise} API response
 */
export async function deleteEvent(eventId) {
    try {
        const response = await api.delete(`/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}

/**
 * RSVP to an event
 * @param {string} eventId - ID of the event to RSVP to
 * @param {boolean} attending - Whether the user is attending
 * @returns {Promise} API response
 */
export async function rsvpToEvent(eventId, attending) {
    try {
        const response = await api.post(`/events/${eventId}/rsvp`, { attending });
        return response.data;
    } catch (error) {
        console.error('Error RSVPing to event:', error);
        throw error;
    }
}
