import apiClient from "../api/apiClient";

/**
 * Fetches all deals for the authenticated user.
 */
export async function getDeals() {
  const response = await apiClient.get("deals");
  return response.data.deals || [];
}

/**
 * Fetches a single deal by ID.
 */
export async function getDealById(id) {
  const response = await apiClient.get(`deals/${id}`);
  return response.data.deal;
}

/**
 * Creates a deal from an accepted proposal.
 */
export async function createDealFromProposal(proposalId) {
  try {
    const response = await apiClient.post("deals/create-from-proposal", {
      proposalId,
    });
    return response.data.dealId;
  } catch (error) {
    console.error("Create deal error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Funds a deal from the buyer's wallet.
 */
export async function fundDeal(dealId) {
  const response = await apiClient.post(`deals/${dealId}/fund`);
  return response.data;
}

/**
 * Submits work/proof for a specific milestone.
 */
export async function submitMilestoneWork(
  dealId,
  milestoneIndex,
  message,
  files
) {
  try {
    const formData = new FormData();
    formData.append("message", message);

    if (files && files.length > 0) {
      files.forEach((file) => {
        let type = file.mimeType || file.type;
        if (!type && file.name.toLowerCase().endsWith(".pdf")) {
          type = "application/pdf";
        }
        formData.append("files", {
          uri: file.uri,
          name: file.name || `submission_${Date.now()}.pdf`,
          type: type || "application/octet-stream",
        });
      });
    }

    // STEP 1: Submit the work [cite: 409]
    const response = await apiClient.post(
      `deals/${dealId}/milestones/${milestoneIndex}/submit`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const result = response.data;

    // STEP 2: Perfect Replica Logic - Trigger Countdown [cite: 410-412]
    if (result.success) {
      try {
        // Wait 1 second to ensure processing is complete [cite: 410]
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call the specific auto-start-countdown endpoint
        await apiClient.post(
          `/deals/${dealId}/milestones/${milestoneIndex}/auto-start-countdown`
        );

        result.countdownStarted = true; // [cite: 412]
      } catch (countdownError) {
        console.warn("Countdown start failed:", countdownError); // [cite: 413]
        result.countdownStarted = false; // [cite: 414]
      }
    }

    return result; // [cite: 415]
  } catch (error) {
    console.error("Submission error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Helper to upload a single file for a milestone.
 */
export async function uploadMilestoneFile(dealId, milestoneIndex, file) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || "application/octet-stream",
  });
  formData.append("dealId", dealId);
  formData.append("milestoneIndex", milestoneIndex.toString());

  const response = await apiClient.post("files/upload-milestone", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    name: response.data.fileName,
    url: response.data.fileUrl,
    size: file.size,
    type: file.mimeType,
    uploadedAt: new Date(),
  };
}

/**
 * Helper to upload multiple files (Max 5).
 */
export async function uploadMultipleFiles(dealId, milestoneIndex, files) {
  if (files.length > 5) {
    throw new Error("Maximum 5 files allowed per milestone");
  }

  const uploadPromises = files.map((file) =>
    uploadMilestoneFile(dealId, milestoneIndex, file)
  );

  return Promise.all(uploadPromises);
}

/**
 * Deletes a file from the server/cloud storage.
 */
export async function deleteFile(fileUrl) {
  try {
    await apiClient.delete("files/delete", {
      data: { fileUrl },
    });
  } catch (error) {
    console.error(
      "Error deleting file:",
      error.response?.data || error.message
    );
    throw error;
  }
}
