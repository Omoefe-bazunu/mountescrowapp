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
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { submitMilestoneWork } from "../../../../../../src/services/deal.service";
import { AppText } from "../../../../../../components/ui/AppText";

export function SubmitWorkModal({
  isOpen,
  onClose,
  dealId,
  milestoneIndex,
  onSuccess,
}) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "*/*",
      });
      if (!result.canceled) {
        setFiles(result.assets); // Expo DocumentPicker uses the 'assets' array [cite: 299]
      }
    } catch (err) {
      Alert.alert("Error", "Could not access files.");
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      return Alert.alert("Required", "Please provide a submission message.");
    }

    setLoading(true);
    try {
      // Replicating Web Result Check [cite: 231-232]
      const result = await submitMilestoneWork(
        dealId,
        milestoneIndex,
        message,
        files
      );

      if (result.success) {
        if (result.countdownStarted) {
          Alert.alert("Success", "Work submitted and countdown timer started!");
        } else {
          Alert.alert(
            "Work Submitted",
            "Work was uploaded, but the countdown did not start. Please contact support."
          );
        }

        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert("Failed", error.message || "Could not submit work.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setFiles([]);
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <AppText style={styles.title}>Submit Work</AppText>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Describe the work you are submitting..."
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.fileBtn} onPress={pickFiles}>
            <Ionicons name="attach" size={20} color="#010e5a" />
            <AppText style={styles.fileBtnText}>
              Attach Deliverables ({files.length})
            </AppText>
          </TouchableOpacity>

          {/* List selected filenames like the web version */}
          {files.map((f, i) => (
            <View key={i} style={styles.fileRow}>
              <Ionicons name="document-outline" size={14} color="#666" />
              <AppText style={styles.fileName}>{f.name}</AppText>
            </View>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={styles.submitText}>
                  Submit & Start Countdown
                </AppText>
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
    padding: 20,
  },
  content: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#010e5a" },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  fileBtnText: { marginLeft: 8, color: "#010e5a", fontWeight: "600" },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingLeft: 8,
  },
  fileName: { fontSize: 12, color: "#666", marginLeft: 5 },
  actions: { marginTop: 20 },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
