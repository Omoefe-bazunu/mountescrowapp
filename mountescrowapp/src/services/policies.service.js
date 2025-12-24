// src/services/policies.service.js
import apiClient from "../api/apiClient";

/**
 * Fetch all policies (Public)
 * [cite: 1738, 2052]
 */
export async function getPolicies() {
  try {
    const response = await apiClient.get("policies");
    return response.data.policies || {};
  } catch (error) {
    console.error("Fetch policies error:", error);
    return {};
  }
}

/**
 * Upload a policy PDF (Admin Only)
 * [cite: 1746, 2043]
 */
export async function uploadPolicyPdf(policyName, file) {
  const formData = new FormData();

  formData.append("policyName", policyName);

  // Format file for React Native FormData
  formData.append("file", {
    uri: file.uri,
    name: file.name || `${policyName.replace(/\s+/g, "_")}.pdf`,
    type: "application/pdf", // Explicitly PDF as per backend requirement [cite: 1747]
  });

  try {
    const response = await apiClient.post("policies/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Upload policy error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to upload PDF");
  }
}

/**
 * Delete a policy PDF (Admin Only)
 * [cite: 1753, 2035]
 */
export async function deletePolicyPdf(policyName) {
  try {
    const response = await apiClient.delete(
      `policies/${encodeURIComponent(policyName)}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Delete policy error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to delete PDF");
  }
}
