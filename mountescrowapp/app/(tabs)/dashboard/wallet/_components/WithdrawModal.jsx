import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import apiClient from "../../../../../src/api/apiClient";

export default function WithdrawModal({ isOpen, onClose, balance, onSuccess }) {
  const [form, setForm] = useState({
    amount: "",
    account: "",
    bankCode: "",
    bankName: "",
    narration: "",
  });
  const [banks, setBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search
  const [loading, setLoading] = useState(false);
  const [showBankList, setShowBankList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("banks")
        .then((res) => setBanks(res.data.banks || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Filter banks based on search query
  const filteredBanks = banks.filter((b) =>
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWithdraw = async () => {
    if (Number(form.amount) > balance)
      return Alert.alert("Error", "Insufficient balance.");
    if (form.account.length !== 10)
      return Alert.alert("Error", "Account number must be 10 digits.");
    if (!form.bankCode) return Alert.alert("Error", "Please select a bank.");

    setLoading(true);
    try {
      await apiClient.post("wallet/withdraw", {
        amount: Number(form.amount).toFixed(2),
        destinationAccount: form.account,
        destinationBankCode: form.bankCode,
        narration: form.narration || "Wallet withdrawal",
      });
      Alert.alert(
        "Success",
        "Withdrawal initiated! You'll receive an email shortly."
      );
      onSuccess();
      handleClose(); // Use internal close to reset states
    } catch (err) {
      Alert.alert("Failed", err.response?.data?.error || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setShowBankList(false);
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Withdraw Funds</Text>

          <Text style={styles.label}>Amount (₦)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="0.00"
            value={form.amount}
            onChangeText={(t) => setForm({ ...form, amount: t })}
          />
          <Text style={styles.balanceHint}>
            Balance: ₦{Number(balance).toLocaleString()}
          </Text>

          <Text style={styles.label}>Select Bank</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowBankList(!showBankList)}
          >
            <Text style={{ color: form.bankName ? "#333" : "#999" }}>
              {form.bankName || "Select bank..."}
            </Text>
          </TouchableOpacity>

          {showBankList && (
            <View style={styles.bankListContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search bank name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              <FlatList
                data={filteredBanks}
                keyExtractor={(item) => item.bankCode}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bankItem}
                    onPress={() => {
                      setForm({
                        ...form,
                        bankCode: item.bankCode,
                        bankName: item.bankName,
                      });
                      setShowBankList(false);
                      setSearchQuery(""); // Reset search on select
                    }}
                  >
                    <Text style={styles.bankItemText}>{item.bankName}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 180 }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No matching banks found.</Text>
                }
              />
            </View>
          )}

          <Text style={styles.label}>Account Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            maxLength={10}
            placeholder="10-digit number"
            value={form.account}
            onChangeText={(t) => setForm({ ...form, account: t })}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Withdraw</Text>
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
  content: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#003366",
  },
  label: { fontSize: 13, color: "#666", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  balanceHint: { fontSize: 11, color: "#999", marginTop: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 30,
    gap: 20,
  },
  cancelText: { color: "#666", fontWeight: "bold" },
  submitBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  bankListContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  searchInput: {
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontSize: 14,
  },
  bankItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  bankItemText: { fontSize: 14, color: "#333" },
  emptyText: { padding: 20, textAlign: "center", color: "#999", fontSize: 13 },
});
