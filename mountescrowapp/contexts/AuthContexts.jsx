import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import apiClient, { setMemoryToken } from "../src/api/apiClient"; // Import cache helper

const AuthContext = createContext({
  user: null,
  loading: true,
  isEmailVerified: false,
  logout: async () => {},
  refresh: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optimized Fetch User
  const fetchUser = useCallback(
    async (manualToken = null) => {
      // Only show full-screen loader if we don't have a user yet
      if (!user) setLoading(true);

      try {
        const token =
          manualToken || (await SecureStore.getItemAsync("userToken"));

        if (!token) {
          setUser(null);
          setMemoryToken(null);
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
    }),
    [user, loading, logout, fetchUser]
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
