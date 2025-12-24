import apiClient from "../api/apiClient";

/**
 * Helper to normalize file data for mobile FormData.
 * Ensures that PDFs and Images have correct MIME types so they open properly.
 */
const formatFileForUpload = (file, defaultName) => {
  let type = file.type || file.mimeType || "application/octet-stream";
  const name = file.name || defaultName;

  // Manual override for common types to ensure backend/mobile compatibility
  if (name.toLowerCase().endsWith(".pdf")) {
    type = "application/pdf";
  } else if (
    name.toLowerCase().endsWith(".jpg") ||
    name.toLowerCase().endsWith(".jpeg")
  ) {
    type = "image/jpeg";
  } else if (name.toLowerCase().endsWith(".png")) {
    type = "image/png";
  }

  return {
    uri: file.uri,
    name: name,
    type: type,
  };
};

/**
 * Creates a new proposal with support for multiple files and milestone descriptions.
 * Matches backend: upload.array("files", 3)
 */
// proposal.service.js (Mobile)

export async function createProposal(data) {
  const {
    projectTitle,
    description,
    counterpartyEmail,
    creatorRole,
    milestones,
    totalAmount,
    escrowFee,
    escrowFeePayer,
    files,
  } = data;

  const formData = new FormData();
  formData.append("projectTitle", projectTitle);
  formData.append("description", description);
  formData.append("counterpartyEmail", counterpartyEmail);
  formData.append("creatorRole", creatorRole);
  formData.append("milestones", JSON.stringify(milestones)); // [cite: 196]
  formData.append("totalAmount", totalAmount.toString());
  formData.append("escrowFee", escrowFee.toString());
  formData.append("escrowFeePayer", escrowFeePayer.toString());

  if (files && files.length > 0) {
    files.forEach((file, index) => {
      // FIX: Ensure PDF type is explicitly sent to the server
      let type = file.mimeType || file.type || "application/octet-stream";
      if (file.name?.toLowerCase().endsWith(".pdf")) {
        type = "application/pdf";
      }

      formData.append("files", {
        // Backend expects "files" for proposals [cite: 189]
        uri: file.uri,
        name: file.name || `proposal_file_${index}.pdf`,
        type: type,
      });
    });
  }

  const { data: responseData } = await apiClient.post("proposals", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return responseData;
}

/**
 * Fetches all proposals for the authenticated user.
 */
export async function getProposals() {
  try {
    const response = await apiClient.get("proposals");
    return response.data.proposals || [];
  } catch (error) {
    console.error(
      "Get proposals error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Updates an existing proposal.
 * Matches backend: upload.array("files", 3) [cite: 226]
 */
export const updateProposal = async (proposalId, proposalData, files = []) => {
  try {
    const formData = new FormData();

    formData.append("projectTitle", proposalData.projectTitle);
    formData.append("description", proposalData.description);
    formData.append("milestones", JSON.stringify(proposalData.milestones));
    formData.append("totalAmount", proposalData.totalAmount.toString());
    formData.append("escrowFee", proposalData.escrowFee.toString());
    formData.append("escrowFeePayer", proposalData.escrowFeePayer.toString());

    if (proposalData.removedFiles && proposalData.removedFiles.length > 0) {
      formData.append(
        "removedFiles",
        JSON.stringify(proposalData.removedFiles)
      );
    }

    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(
          "files",
          formatFileForUpload(file, `update_${index}_${Date.now()}`)
        );
      });
    }

    const { data } = await apiClient.patch(
      `proposals/${proposalId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return data;
  } catch (error) {
    console.error(
      "Update proposal service error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Buyer accepts and funds a proposal.
 * [cite: 296]
 */
export async function acceptAndFundSellerInitiatedProposal(id, userId) {
  try {
    const response = await apiClient.post(`proposals/${id}/accept-and-fund`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Accept and Fund error:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Transaction failed");
  }
}

/**
 * Fetches a single proposal by ID.
 * [cite: 220]
 */
export async function getProposalById(id) {
  try {
    const response = await apiClient.get(`proposals/${id}`);
    return response.data.proposal;
  } catch (error) {
    console.error(
      "Get proposal by ID error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Updates the status of a proposal.
 * [cite: 252]
 */
export async function updateProposalStatus(id, status) {
  try {
    const response = await apiClient.patch(`proposals/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update status error:",
      error.response?.data || error.message
    );
    throw error;
  }
}
