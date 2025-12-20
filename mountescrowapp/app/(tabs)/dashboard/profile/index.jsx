import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";
import ChangePasswordModal from "./_components/ChangePasswordModal";
import { format } from "date-fns";

export default function ProfileScreen() {
  // Pull 'logout' directly from your AuthContext
  const { user, refresh, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
  });
  const router = useRouter();

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? "N/A" : format(date, "PPP");
    } catch (e) {
      return "N/A";
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await apiClient.get("auth/check");
      const profile = res.data.user;

      if (profile) {
        setUserData(profile);
        setFormData({
          displayName: profile.displayName || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });
      }
    } catch (e) {
      console.error("Profile Fetch Error:", e.response?.data || e.message);
      Alert.alert("Error", "Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch("users/update-profile", formData);
      Alert.alert("Success", "Profile updated.");
      setIsEditing(false);
      await refresh();
      fetchUserData();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // LOGOUT HANDLER USING CONTEXT
  const handleLogoutPress = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // This clears SecureStore AND sets user state to null globally
          await logout();
          // Navigation will happen automatically via your root layout guards,
          // but we add this for safety.
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#f97316" />
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
        >
          <Text style={styles.editBtn}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {isEditing ? (
          <View>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(t) => setFormData({ ...formData, displayName: t })}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <InfoRow
              icon="person"
              label="Full Name"
              value={userData?.displayName}
            />
            <InfoRow icon="mail" label="Email" value={userData?.email} />
            <InfoRow icon="call" label="Phone" value={userData?.phone} />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        <View style={styles.infoBox}>
          <StatusRow
            label="KYC Status"
            value={userData?.kycStatus?.toUpperCase()}
          />
          <StatusRow
            label="Email Verified"
            value={userData?.isVerified ? "Verified" : "Pending"}
          />
          <StatusRow
            label="Member Since"
            value={formatDate(userData?.createdAt)}
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.securityBtn}
          onPress={() => setShowPasswordModal(true)}
        >
          <Ionicons name="key-outline" size={20} color="#003366" />
          <Text style={styles.securityText}>Change Password</Text>
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </ScrollView>
  );
}

// ... keeping InfoRow and StatusRow as they were ...
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#999" />
    <View style={{ marginLeft: 15 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

const StatusRow = ({ label, value }) => (
  <View style={[styles.row, { justifyContent: "space-between" }]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#003366" },
  editBtn: { color: "#f97316", fontWeight: "600" },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoBox: { backgroundColor: "#fff", borderRadius: 12, padding: 15 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLabel: { fontSize: 12, color: "#999" },
  rowValue: { fontSize: 16, color: "#333", fontWeight: "500" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#f97316",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  actionsContainer: { padding: 20 },
  securityBtn: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  securityText: { marginLeft: 10, fontWeight: "600", color: "#003366" },
  logoutBtn: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  logoutText: { marginLeft: 10, fontWeight: "bold", color: "#ef4444" },
});
