// import React, {
//   useState,
//   useEffect,
//   createContext,
//   useContext,
//   useMemo,
//   useCallback,
// } from "react";
// import * as SecureStore from "expo-secure-store";
// import apiClient, { setMemoryToken } from "../src/api/apiClient"; // Import cache helper

// const AuthContext = createContext({
//   user: null,
//   loading: true,
//   isEmailVerified: false,
//   logout: async () => {},
//   refresh: async () => {},
// });

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Optimized Fetch User
//   const fetchUser = useCallback(
//     async (manualToken = null) => {
//       // Only show full-screen loader if we don't have a user yet
//       if (!user) setLoading(true);

//       try {
//         const token =
//           manualToken || (await SecureStore.getItemAsync("userToken"));

//         if (!token) {
//           setUser(null);
//           setMemoryToken(null);
//           return;
//         }

//         // 1. Update the Memory Cache immediately so subsequent calls are fast
//         setMemoryToken(token);

//         // 2. We use the token explicitly to avoid waiting for the interceptor logic on first boot
//         const res = await apiClient.get("/auth/check", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setUser(res.data.user);
//       } catch (err) {
//         console.error("Auth Check Error:", err.message);

//         // 3. Only wipe token if the error is 401 (Unauthorized)
//         if (err.response?.status === 401) {
//           setUser(null);
//           setMemoryToken(null);
//           await SecureStore.deleteItemAsync("userToken");
//         }
//       } finally {
//         setLoading(false);
//       }
//     },
//     [user]
//   );

//   const logout = useCallback(async () => {
//     try {
//       // Inform backend. We don't 'await' this to speed up local UI transition
//       apiClient.post("/auth/logout").catch(() => {});

//       // 4. Clear both persistent storage and memory cache
//       await SecureStore.deleteItemAsync("userToken");
//       setMemoryToken(null);

//       setUser(null);
//       console.log("✅ Logged out successfully");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   // MEMOIZE THE VALUE: Prevents app-wide re-renders unless data actually changes
//   const authValue = useMemo(
//     () => ({
//       user,
//       loading,
//       isEmailVerified: user?.isVerified || false,
//       logout,
//       refresh: fetchUser,
//     }),
//     [user, loading, logout, fetchUser]
//   );

//   return (
//     <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import apiClient, { setMemoryToken } from "../src/api/apiClient";
// Import cache helper

const AuthContext = createContext({
  user: null,
  loading: true,
  isEmailVerified: false,
  logout: async () => {},
  refresh: async () => {},
  notifyInteraction: () => {}, // New: Method to reset timer from UI
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef(null);

  // Optimized Fetch User
  const fetchUser = useCallback(
    async (manualToken = null) => {
      // Only show full-screen loader if we don't have a user yet
      if (!user) setLoading(true);

      try {
        // MODIFICATION: We ONLY use manualToken (from login) or memory.
        // We DO NOT load from SecureStore on mount to ensure "Login on App Open" requirement.
        const token = manualToken;

        if (!token) {
          setUser(null);
          setMemoryToken(null);
          // If no token provided manually, we stop here.
          // This effectively logs the user out when the app is restarted.
          return;
        }

        // 1. Update the Memory Cache immediately so subsequent calls are fast
        setMemoryToken(token);

        // 2. We use the token explicitly to avoid waiting for the interceptor logic on first boot
        const res = await apiClient.get("/auth/check", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Auth Check Error:", err.message);

        // 3. Only wipe token if the error is 401 (Unauthorized)
        if (err.response?.status === 401) {
          setUser(null);
          setMemoryToken(null);
          await SecureStore.deleteItemAsync("userToken");
        }
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const logout = useCallback(async () => {
    try {
      // Clear inactivity timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Inform backend. We don't 'await' this to speed up local UI transition
      apiClient.post("/auth/logout").catch(() => {});

      // 4. Clear both persistent storage and memory cache
      await SecureStore.deleteItemAsync("userToken");
      setMemoryToken(null);

      setUser(null);
      console.log("✅ Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  // --- Inactivity Logic ---
  const notifyInteraction = useCallback(() => {
    if (!user) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Get timeout from env or default to 1 minute
    const timeoutMinutes =
      process.env.EXPO_PUBLIC_INACTIVITY_TIMEOUT_MINUTES || 1;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    idleTimerRef.current = setTimeout(() => {
      console.log("💤 Mobile user inactive. Logging out...");
      logout();
    }, timeoutMs);
  }, [user, logout]);
  // ------------------------

  // Start timer when user changes
  useEffect(() => {
    if (user) {
      notifyInteraction();
    } else {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [user, notifyInteraction]);

  useEffect(() => {
    fetchUser();
  }, []);

  // MEMOIZE THE VALUE: Prevents app-wide re-renders unless data actually changes
  const authValue = useMemo(
    () => ({
      user,
      loading,
      isEmailVerified: user?.isVerified || false,
      logout,
      refresh: fetchUser,
      notifyInteraction,
    }),
    [user, loading, logout, fetchUser, notifyInteraction]
  );

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
