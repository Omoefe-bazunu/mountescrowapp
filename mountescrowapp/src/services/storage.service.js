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
 * Matches backend: upload.single("file")
 */
// storage.service.js (Mobile)

export async function uploadMilestoneFile(dealId, milestoneIndex, file) {
  validateFile(file); // [cite: 715]

  const formData = new FormData();

  // Robust MIME type detection
  let type = file.mimeType || file.type || "application/octet-stream"; // [cite: 718, 719]

  // Force correct PDF MIME type for the backend
  if (file.name?.toLowerCase().endsWith(".pdf")) {
    type = "application/pdf"; // [cite: 719, 720]
  }

  formData.append("file", {
    // Field name must be "file" [cite: 254]
    uri: file.uri,
    name: file.name || `upload_${Date.now()}.pdf`,
    type: type, // This tells the backend what content-type to use [cite: 720]
  });

  formData.append("dealId", dealId); // [cite: 254]
  formData.append("milestoneIndex", milestoneIndex.toString()); // [cite: 254]

  const response = await apiClient.post(
    "/api/files/upload-milestone",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }, // [cite: 721]
    }
  );

  return {
    name: response.data.fileName, // [cite: 722]
    url: response.data.fileUrl,
    size: file.size,
    type: type,
    uploadedAt: new Date(),
  };
}
