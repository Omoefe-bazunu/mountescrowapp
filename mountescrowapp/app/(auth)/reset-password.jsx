import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/apiClient";

export default function ResetPasswordScreen() {
  const [step, setStep] = useState("email"); // email, code, newPassword
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // Step 1: Request Code
  const handleSendCode = async () => {
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password/request", {
        email: email.trim(),
      });
      setStep("code");
      Alert.alert("Success", "Verification code sent to your email.");
    } catch (err) {
      Alert.alert("Request Failed", err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    if (code.length < 4) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password/verify", {
        email,
        code: code.trim(),
      });
      setStep("newPassword");
    } catch (err) {
      Alert.alert(
        "Verification Failed",
        err.response?.data?.error || "Invalid code"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Change Password
  const handleChangePassword = async () => {
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password/complete", {
        email,
        code,
        password,
      });
      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === "email" && "Reset Password"}
            {step === "code" && "Verify Code"}
            {step === "newPassword" && "New Password"}
          </Text>

          <Text style={styles.subtitle}>
            {step === "email" &&
              "Enter your email to receive a verification code."}
            {step === "code" && "Enter the 8-digit code sent to your email."}
            {step === "newPassword" &&
              "Your new password must be different from previous passwords."}
          </Text>

          {/* Render Step 1 */}
          {step === "email" && (
            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Render Step 2 */}
          {step === "code" && (
            <View style={styles.form}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="12345678"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={8}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify Code</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep("email")}>
                <Text style={styles.backText}>Change Email</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Render Step 3 */}
          {step === "newPassword" && (
            <View style={styles.form}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 45 }]}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { padding: 10 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  form: { width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  codeInput: {
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 5,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#f97316",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  passwordContainer: { position: "relative", justifyContent: "center" },
  eyeIcon: { position: "absolute", right: 15 },
  backText: {
    textAlign: "center",
    color: "#003366",
    marginTop: 20,
    fontWeight: "500",
  },
});
