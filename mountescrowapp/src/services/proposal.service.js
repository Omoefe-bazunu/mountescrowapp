// import apiClient from "../api/apiClient";

// export async function createProposal(data) {
//   const {
//     projectTitle,
//     description,
//     counterpartyEmail,
//     creatorRole,
//     milestones,
//     totalAmount,
//     escrowFee,
//     escrowFeePayer,
//     files,
//   } = data;

//   const formData = new FormData();
//   formData.append("projectTitle", projectTitle);
//   formData.append("description", description);
//   formData.append("counterpartyEmail", counterpartyEmail);
//   formData.append("creatorRole", creatorRole);
//   formData.append("milestones", JSON.stringify(milestones));
//   formData.append("totalAmount", totalAmount.toString());
//   formData.append("escrowFee", escrowFee.toString());
//   formData.append("escrowFeePayer", escrowFeePayer.toString());

//   if (files && files.length > 0) {
//     files.forEach((file) => {
//       formData.append("files", {
//         uri: file.uri,
//         name: file.name || "document.pdf",
//         type: file.type || "application/pdf",
//       });
//     });
//   }

//   // Path corrected to relative "proposals"
//   const { data: responseData } = await apiClient.post("proposals", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   return {
//     proposalId: responseData.proposalId,
//     emailData: responseData.emailData,
//   };
// }

// export async function getProposals() {
//   // Path corrected to relative "proposals" [cite: 249]
//   const response = await apiClient.get("proposals");
//   return response.data.proposals || [];
// }

// // Add this to your proposal.service.js if it's missing
// export const updateProposal = async (proposalId, proposalData, files = []) => {
//   try {
//     const formData = new FormData();
//     formData.append("projectTitle", proposalData.projectTitle);
//     formData.append("description", proposalData.description);
//     formData.append("milestones", JSON.stringify(proposalData.milestones));
//     formData.append("totalAmount", proposalData.totalAmount.toString());
//     formData.append("escrowFee", proposalData.escrowFee.toString());
//     formData.append("escrowFeePayer", proposalData.escrowFeePayer.toString());

//     if (proposalData.removedFiles && proposalData.removedFiles.length > 0) {
//       formData.append(
//         "removedFiles",
//         JSON.stringify(proposalData.removedFiles)
//       );
//     }

//     files.forEach((file) => {
//       formData.append("files", {
//         uri: file.uri,
//         name: file.name || "update_file",
//         type: file.type || "application/octet-stream",
//       });
//     });

//     // Path corrected to relative "proposals/${proposalId}"
//     const { data } = await apiClient.patch(
//       `proposals/${proposalId}`,
//       formData,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//       }
//     );
//     return data;
//   } catch (error) {
//     console.error("Update proposal error:", error);
//     throw error;
//   }
// };

// export async function getProposalById(id) {
//   // Use relative path to avoid 404 errors as previously discussed
//   const response = await apiClient.get(`proposals/${id}`);

//   // FIX: Return the proposal object directly, not the wrapper
//   return response.data.proposal;
// }

// export async function updateProposalStatus(id, status) {
//   // Path corrected to relative "proposals/${id}/status" [cite: 252]
//   const response = await apiClient.patch(`proposals/${id}/status`, { status });
//   return response.data;
// }

import apiClient from "../api/apiClient";

/**
 * Creates a new proposal with support for multiple files and milestone descriptions.
 */
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

  // Milestones are stringified so the backend can parse the array
  formData.append("milestones", JSON.stringify(milestones));

  formData.append("totalAmount", totalAmount.toString());
  formData.append("escrowFee", escrowFee.toString());
  formData.append("escrowFeePayer", escrowFeePayer.toString());

  // Handle file uploads
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name || `upload_${Date.now()}.pdf`,
        type: file.type || "application/pdf",
      });
    });
  }

  try {
    const { data: responseData } = await apiClient.post("proposals", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      proposalId: responseData.proposalId,
      emailData: responseData.emailData,
    };
  } catch (error) {
    console.error(
      "Create proposal error:",
      error.response?.data || error.message
    );
    throw error;
  }
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
 */
export const updateProposal = async (proposalId, proposalData, files = []) => {
  try {
    const formData = new FormData();

    // Core Fields
    formData.append("projectTitle", proposalData.projectTitle);
    formData.append("description", proposalData.description);
    formData.append("milestones", JSON.stringify(proposalData.milestones));

    // Financial Fields (Must be strings for FormData but represent numbers)
    formData.append("totalAmount", proposalData.totalAmount.toString());
    formData.append("escrowFee", proposalData.escrowFee.toString());
    formData.append("escrowFeePayer", proposalData.escrowFeePayer.toString());

    // Files logic
    if (proposalData.removedFiles && proposalData.removedFiles.length > 0) {
      formData.append(
        "removedFiles",
        JSON.stringify(proposalData.removedFiles)
      );
    }

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name || `update_${Date.now()}`,
          type: file.type || "application/octet-stream",
        });
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

export async function acceptAndFundSellerInitiatedProposal(id, userId) {
  try {
    // We pass the userId if your backend requires it for wallet deduction
    const response = await apiClient.post(`proposals/${id}/accept-and-fund`, {
      userId,
    });
    return response.data; // Should return { dealId, deductedAmount }
  } catch (error) {
    console.error(
      "Accept and Fund error:",
      error.response?.data || error.message
    );
    // Re-throw the specific error message from the backend (e.g., "Insufficient balance")
    throw new Error(error.response?.data?.error || "Transaction failed");
  }
}

/**
 * Fetches a single proposal by ID.
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
 * Updates the status (e.g., accepted, rejected) of a proposal.
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
