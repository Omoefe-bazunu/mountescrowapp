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
} from "react-native";
import apiClient from "../../../../../src/api/apiClient";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (newPass !== confirm)
      return Alert.alert("Error", "Passwords do not match");
    if (newPass.length < 8)
      return Alert.alert("Error", "Minimum 8 characters required");

    setLoading(true);
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword: current,
        newPassword: newPass,
      });
      Alert.alert("Success", "Password updated successfully.");
      onClose();
      setCurrent("");
      setNewPass("");
      setConfirm("");
    } catch (e) {
      Alert.alert(
        "Failed",
        e.response?.data?.error || "Could not change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdate}
              style={styles.updateBtn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 25,
  },
  content: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#003366",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    alignItems: "center",
  },
  cancelBtn: { marginRight: 25 },
  updateBtn: {
    backgroundColor: "#003366",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  updateText: { color: "#fff", fontWeight: "bold" },
});
