import apiClient from "../api/apiClient";

/**
 * Sends a contact message to the backend.
 * @param {Object} data - { name, email, phone, message }
 */
export async function sendContactMessage(data) {
  try {
    const response = await apiClient.post("/contact", data);
    return response.data;
  } catch (error) {
    console.error("Send contact message error:", error);
    throw error;
  }
}
