// import axios from "axios";
// import * as SecureStore from "expo-secure-store";

// const apiClient = axios.create({
//   baseURL: "https://fcmb-proxy.onrender.com/api/",
//   timeout: 15000, // Important: prevent infinite hanging if Render is slow
// });

// // Cache the token in memory to avoid constant I/O hits
// let memoryToken = null;

// // Function to update the memory token (Call this from Login or AuthContext)
// export const setMemoryToken = (token) => {
//   memoryToken = token;
// };

// apiClient.interceptors.request.use(async (config) => {
//   // If we don't have it in memory, try to get it once
//   if (!memoryToken) {
//     memoryToken = await SecureStore.getItemAsync("userToken");
//   }

//   if (memoryToken) {
//     config.headers.Authorization = `Bearer ${memoryToken}`;
//   }
//   return config;
// });

// export default apiClient;

import axios from "axios";
import * as SecureStore from "expo-secure-store";

// This secret is used specifically for automated backend triggers
const AUTO_APPROVE_SECRET = "mount_escrow_auto_approve_secret_key_09043970401";

const apiClient = axios.create({
  baseURL: "https://fcmb-proxy.onrender.com/api/",
  timeout: 15000,
});

// Cache the token in memory to avoid constant I/O hits
let memoryToken = null;

// Function to update the memory token
export const setMemoryToken = (token) => {
  memoryToken = token;
};

apiClient.interceptors.request.use(async (config) => {
  /**
   * SPECIFIC TRIGGER CHECK:
   * If the URL targets the auto-approve endpoint, we use the system secret
   * instead of the user's personal token [cite: 341-342].
   */
  if (config.url && config.url.includes("/auto-approve")) {
    config.headers.Authorization = `Bearer ${AUTO_APPROVE_SECRET}`;
    return config;
  }

  // Regular request logic: use memory token or fetch from SecureStore
  if (!memoryToken) {
    memoryToken = await SecureStore.getItemAsync("userToken");
  }

  if (memoryToken) {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }

  return config;
});

export default apiClient;
