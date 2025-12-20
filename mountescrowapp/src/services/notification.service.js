import apiClient from "../api/apiClient";

/**
 * Fetches paginated notifications for the mobile user.
 */
export async function getNotifications(page = 1, limit = 20) {
  try {
    const response = await apiClient.get(
      `notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Get notifications error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Gets the total unread notification count.
 */
export async function getNotificationCount() {
  try {
    const response = await apiClient.get("notifications/count");
    return response.data;
  } catch (error) {
    console.error("Get count error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId) {
  try {
    // Note: Mobile calls the backend directly, which uses /read
    const response = await apiClient.patch(
      `notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Mark read error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Marks all user notifications as read.
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await apiClient.patch("notifications/mark-all-read");
    return response.data;
  } catch (error) {
    console.error(
      "Mark all read error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Deletes a notification from history.
 */
export async function deleteNotification(notificationId) {
  try {
    const response = await apiClient.delete(`notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete notification error:",
      error.response?.data || error.message
    );
    throw error;
  }
}
