import apiClient from "../api/apiClient";

/**
 * Creates a dispute by sending data to the Render backend.
 * Removed Firebase 'auth' in favor of backend session/token handling via apiClient.
 */
export async function createDispute(
  dealId,
  milestoneIndex,
  reason,
  projectTitle
) {
  try {
    const response = await apiClient.post("/disputes", {
      dealId,
      projectTitle, // Added to fix missing fields error
      milestoneIndex: Number(milestoneIndex),
      reason: reason.trim(),
    });
    return response.data.disputeId;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to raise dispute");
  }
}

/**
 * Fetches disputes for the current user via the backend API.
 */
export async function getDisputes() {
  try {
    const response = await apiClient.get("/disputes");
    return response.data.disputes || [];
  } catch (error) {
    console.error(
      "Fetch Disputes Error:",
      error.response?.data || error.message
    );
    throw error;
  }
}
