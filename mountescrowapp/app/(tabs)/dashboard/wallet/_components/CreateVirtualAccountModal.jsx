import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import apiClient from "../../../../../src/api/apiClient";
import { useAuth } from "../../../../../contexts/AuthContexts";
import { AppText } from "../../../../../components/ui/AppText";

export default function CreateVirtualAccountModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("virtual-account/create", form);

      if (res.data.success) {
        Alert.alert("Success", "Virtual account created successfully!");
        onSuccess(); // Trigger reload of wallet data
        onClose();
      } else {
        throw new Error(res.data.message || "Failed to create account.");
      }
    } catch (err) {
      Alert.alert(
        "Account Creation Failed",
        err.response?.data?.error || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppText style={styles.title}>Create Virtual Account</AppText>
            <AppText style={styles.subtitle}>
              Link a secure funding account to your profile.
            </AppText>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Email</AppText>
              <TextInput
                style={[styles.input, styles.disabled]}
                value={form.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>First Name</AppText>
              <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(t) => setForm({ ...form, firstName: t })}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Last Name</AppText>
              <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(t) => setForm({ ...form, lastName: t })}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Phone Number</AppText>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="e.g. 08012345678"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={loading}
              >
                <AppText style={styles.cancelText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText style={styles.submitText}>Create Account</AppText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabled: { backgroundColor: "#f5f5f5", color: "#999" },
  actions: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 20 },
  cancelBtn: { flex: 1, padding: 16, alignItems: "center" },
  cancelText: { color: "#666", fontWeight: "bold" },
  submitBtn: {
    flex: 2,
    backgroundColor: "#003366",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
