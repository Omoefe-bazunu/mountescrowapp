// import apiClient from "../api/apiClient";

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// const ALLOWED_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
//   "application/zip",
//   "application/x-zip-compressed",
// ];

// /**
//  * Validate file on mobile side before upload
//  * Note: 'file' here is the result from expo-document-picker
//  */
// export const validateFile = (file) => {
//   if (file.size > MAX_FILE_SIZE) {
//     throw new Error(`File size must be less than 10MB`);
//   }
//   // Optional: Check mimeType if available from the picker
//   if (file.mimeType && !ALLOWED_TYPES.includes(file.mimeType)) {
//     throw new Error("File type not allowed.");
//   }
// };

// /**
//  * Upload a single milestone file
//  */
// export async function uploadMilestoneFile(dealId, milestoneIndex, file) {
//   validateFile(file);

//   const formData = new FormData();
//   formData.append("file", {
//     uri: file.uri,
//     name: file.name || "upload",
//     type: file.mimeType || "application/octet-stream",
//   });
//   formData.append("dealId", dealId);
//   formData.append("milestoneIndex", milestoneIndex.toString());

//   const response = await apiClient.post("/files/upload-milestone", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   return {
//     name: response.data.fileName,
//     url: response.data.fileUrl,
//     size: file.size,
//     type: file.mimeType,
//     uploadedAt: new Date(),
//   };
// }

// /**
//  * Upload multiple files for a milestone
//  */
// export async function uploadMultipleFiles(dealId, milestoneIndex, files) {
//   if (files.length > 5) {
//     throw new Error("Maximum 5 files allowed per milestone");
//   }

//   const uploadPromises = files.map((file) =>
//     uploadMilestoneFile(dealId, milestoneIndex, file)
//   );

//   return Promise.all(uploadPromises);
// }

// /**
//  * Delete a file through backend
//  */
// export async function deleteFile(fileUrl) {
//   try {
//     await apiClient.delete("/files/delete", {
//       data: { fileUrl },
//     });
//   } catch (error) {
//     console.error("Error deleting file:", error);
//   }
// }

import apiClient from "../api/apiClient";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
];

export const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size must be less than 10MB`);
  }
  const type = file.mimeType || file.type;
  if (type && !ALLOWED_TYPES.includes(type)) {
    throw new Error("File type not allowed.");
  }
};

/**
 * Upload a single milestone file
 * PERFECT REPLICA: Matches the web backend's "files" field name
 */
export async function uploadMilestoneFile(dealId, milestoneIndex, file) {
  validateFile(file);

  const formData = new FormData();

  // Robust MIME type detection [cite: 157-160]
  let type = file.mimeType || file.type || "application/octet-stream";
  if (file.name?.toLowerCase().endsWith(".pdf")) {
    type = "application/pdf";
  }

  formData.append("files", {
    // Changed from "file" to "files" to match web backend
    uri: file.uri,
    name: file.name || "upload.pdf",
    type: type,
  });

  formData.append("dealId", dealId);
  formData.append("milestoneIndex", milestoneIndex.toString());

  const response = await apiClient.post("/files/upload-milestone", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    name: response.data.fileName,
    url: response.data.fileUrl,
    size: file.size,
    type: type,
    uploadedAt: new Date(),
  };
}
