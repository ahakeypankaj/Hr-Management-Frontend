import api from './api'

/**
 * Fetch all notifications for the current user
 * @returns {Promise} API response with notifications array
 */
export async function fetchNotifications() {
  try {
    const response = await api.get('/notification');
    console.log("Notifications API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 * @returns {Promise} API response with unreadCount
 */
export async function getUnreadCount() {
  try {
    const response = await api.get('/notification/unread-count');
    console.log("Unread count API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} API response
 */
export async function markAsRead(notificationId) {
  try {
    const response = await api.patch(`/notification/${notificationId}/read`);
    console.log("Mark as read response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise} API response
 */
export async function markAllAsRead() {
  try {
    const response = await api.patch('/notification/read-all');
    console.log("Mark all as read response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}
