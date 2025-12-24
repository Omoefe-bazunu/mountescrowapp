// testimonials.service.js (Mobile)

import apiClient from "../api/apiClient";

export async function getTestimonials() {
  try {
    const response = await apiClient.get("testimonials");
    return response.data.testimonials || [];
  } catch (error) {
    console.error(
      "Get testimonials error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function getMyTestimonial() {
  try {
    const response = await apiClient.get("testimonials/my");
    return response.data.testimonial;
  } catch (error) {
    console.error(
      "Get my testimonial error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function createTestimonial(data, photoFile = null) {
  try {
    const formData = new FormData();
    formData.append("authorName", data.authorName);
    formData.append("authorTitle", data.authorTitle);
    formData.append("review", data.review);
    formData.append("rating", data.rating.toString());
    if (photoFile) {
      formData.append("photo", {
        uri: photoFile.uri,
        name: photoFile.name || `photo_${Date.now()}.jpg`,
        type: photoFile.type || "image/jpeg",
      });
    }

    const response = await apiClient.post("testimonials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Create testimonial error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function updateTestimonial(id, data, photoFile = null) {
  try {
    const formData = new FormData();
    formData.append("authorName", data.authorName);
    formData.append("authorTitle", data.authorTitle);
    formData.append("review", data.review);
    formData.append("rating", data.rating.toString());
    if (photoFile) {
      formData.append("photo", {
        uri: photoFile.uri,
        name: photoFile.name || `photo_${Date.now()}.jpg`,
        type: photoFile.type || "image/jpeg",
      });
    }

    const response = await apiClient.patch(`testimonials/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update testimonial error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export async function deleteTestimonial(id) {
  try {
    const response = await apiClient.delete(`testimonials/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete testimonial error:",
      error.response?.data || error.message
    );
    throw error;
  }
}
