// src/services/testimonials.service.js
import apiClient from "../api/apiClient";

/**
 * Get all testimonials for the carousel
 */
export async function getAllTestimonials() {
  try {
    const response = await apiClient.get("/testimonials");
    return response.data.testimonials || [];
  } catch (error) {
    console.error("Fetch testimonials error:", error);
    return [];
  }
}

/**
 * Get the logged-in user's personal testimonial (if any)
 */
export async function getMyTestimonial() {
  try {
    // This endpoint should return the user's testimonial if it exists
    const response = await apiClient.get("/testimonials/my");
    return response.data.testimonial || null;
  } catch (error) {
    // If 404 or empty, it means the user hasn't posted one yet
    return null;
  }
}

/**
 * Create a new testimonial
 */
export async function createTestimonial(data, photoFile) {
  const formData = new FormData();
  formData.append("authorName", data.authorName);
  formData.append("authorTitle", data.authorTitle);
  formData.append("review", data.review);
  formData.append("rating", String(data.rating));

  if (photoFile) {
    formData.append("photo", {
      uri: photoFile.uri,
      name: photoFile.fileName || "photo.jpg",
      type: "image/jpeg", // Adjust if you support png
    });
  }

  const response = await apiClient.post("/testimonials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Update an existing testimonial
 */
export async function updateTestimonial(id, data, photoFile) {
  const formData = new FormData();
  formData.append("authorName", data.authorName);
  formData.append("authorTitle", data.authorTitle);
  formData.append("review", data.review);
  formData.append("rating", String(data.rating));

  if (photoFile) {
    formData.append("photo", {
      uri: photoFile.uri,
      name: photoFile.fileName || "photo.jpg",
      type: "image/jpeg",
    });
  }

  const response = await apiClient.patch(`/testimonials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id) {
  const response = await apiClient.delete(`/testimonials/${id}`);
  return response.data;
}
