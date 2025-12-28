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
import { Ionicons } from "@expo/vector-icons"; // Added for security icon
import apiClient from "../../../../../src/api/apiClient";

export default function WithdrawModal({
  isOpen,
  onClose,
  balance,
  onSuccess,
  userEmail,
}) {
  // --- OTP States ---
  const [step, setStep] = useState(1); // 1: OTP, 2: Withdrawal Form
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // --- Original Form States ---
  const [form, setForm] = useState({
    amount: "",
    account: "",
    bankCode: "",
    bankName: "",
    narration: "",
  });
  const [banks, setBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBankList, setShowBankList] = useState(false);

  // Fetch banks on open (Original logic)
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("banks")
        .then((res) => setBanks(res.data.banks || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // --- OTP Handlers ---
  const handleSendOTP = async () => {
    setOtpLoading(true);
    try {
      const res = await apiClient.post("wallet/withdraw/send-otp");
      if (res.data.success) {
        setOtpSent(true);
        Alert.alert(
          "Code Sent",
          "Please check your email for the verification code."
        );
      }
    } catch (err) {
      Alert.alert("Error", "Failed to send verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;
    setOtpLoading(true);
    try {
      const res = await apiClient.post("wallet/withdraw/verify-otp", { otp });
      if (res.data.success) {
        setStep(2); // Move to original form
      }
    } catch (err) {
      Alert.alert(
        "Invalid Code",
        err.response?.data?.error || "Verification failed."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Original Withdrawal Logic ---
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
      handleClose();
    } catch (err) {
      Alert.alert("Failed", err.response?.data?.error || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setOtp("");
    setOtpSent(false);
    setSearchQuery("");
    setShowBankList(false);
    setForm({
      amount: "",
      account: "",
      bankCode: "",
      bankName: "",
      narration: "",
    });
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Withdraw Funds</Text>

          {step === 1 ? (
            /* STEP 1: OTP VERIFICATION */
            <View style={styles.otpWrapper}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={40} color="#003366" />
              </View>

              {!otpSent ? (
                <>
                  <Text style={styles.otpDesc}>
                    To protect your funds, we need to verify your identity. A
                    6-digit code will be sent to your email.
                  </Text>
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSendOTP}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Send Code</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{ marginTop: 15 }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Enter Verification Code</Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="000000"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      { opacity: otp.length === 6 ? 1 : 0.6 },
                    ]}
                    onPress={handleVerifyOTP}
                    disabled={otp.length < 6 || otpLoading}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Verify & Continue</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendOTP}
                    style={{ marginTop: 15 }}
                  >
                    <Text style={styles.resendText}>
                      Didn&apos;t get code? Resend
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            /* STEP 2: ORIGINAL FORM (UNTOUCHED) */
            <View>
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
                          setSearchQuery("");
                        }}
                      >
                        <Text style={styles.bankItemText}>{item.bankName}</Text>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 180 }}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        No matching banks found.
                      </Text>
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
          )}
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
  // --- New OTP Styles ---
  otpWrapper: { alignItems: "center", paddingVertical: 10 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  otpDesc: {
    textAlign: "center",
    color: "#666",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpInput: {
    borderBottomWidth: 2,
    borderBottomColor: "#003366",
    width: "80%",
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 8,
    marginBottom: 25,
    color: "#333",
  },
  resendText: { color: "#003366", fontSize: 12, fontWeight: "600" },
  // --- Original Styles ---
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
    minWidth: 120,
    alignItems: "center",
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
