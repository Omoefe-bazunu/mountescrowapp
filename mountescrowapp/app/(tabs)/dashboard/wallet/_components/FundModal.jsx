import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FundModal({ isOpen, onClose, account }) {
  const copyToClipboard = (text) => {
    if (!text) return;
    Clipboard.setString(text);
    Alert.alert("Copied!", "Account number copied to clipboard.");
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Fund Your Wallet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            {account?.virtualAccountNumber
              ? "Transfer money to this account to fund your wallet. Funds will be automatically credited."
              : "You need to create a virtual account to fund your wallet."}
          </Text>

          {account?.virtualAccountNumber && (
            <View style={styles.infoBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Account Number</Text>
                <View style={styles.copyRow}>
                  <Text style={styles.value}>
                    {account.virtualAccountNumber}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(account.virtualAccountNumber)
                    }
                  >
                    <Ionicons name="copy-outline" size={18} color="#003366" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Bank Name</Text>
                <Text style={styles.value}>{account.bankName} MFB</Text>
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  💡 Note: Transfers may take a few minutes to reflect in your
                  balance.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
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
  content: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#003366" },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: { fontSize: 13, color: "#666" },
  copyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
  },
  noteBox: {
    marginTop: 15,
    backgroundColor: "#eff6ff",
    padding: 10,
    borderRadius: 8,
  },
  noteText: { fontSize: 12, color: "#1d4ed8", lineHeight: 18 },
  closeBtn: {
    backgroundColor: "#003366",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "bold" },
});
