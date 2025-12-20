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
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../src/api/apiClient";
import { useAuth } from "../../contexts/AuthContexts";

export default function VerifyAccountScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // FIX 1: Destructure 'refresh' from the context object
  const { refresh } = useAuth();

  const [resending, setResending] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    // FIX 2: Normalize inputs (Trim and Lowercase)
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanCode) {
      Alert.alert(
        "Missing Information",
        "Please enter both your email and the verification code."
      );
      return;
    }

    setLoading(true);
    try {
      // Send normalized data to backend
      const response = await apiClient.post("/verify", {
        email: cleanEmail,
        token: cleanCode,
      });

      const { token } = response.data;

      if (token) {
        // 1. Store the new token
        await SecureStore.setItemAsync("userToken", token);

        // 2. Refresh AuthContext immediately using the new token
        // This updates the 'user' state and 'isVerified' globally
        await refresh(token);

        Alert.alert("✅ Email Verified!", "Your account is now ready.", [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)/dashboard"),
          },
        ]);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Invalid code or email.";
      Alert.alert("Verification Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email address first.");
      return;
    }

    setResending(true);
    try {
      await apiClient.post("/auth/resend-code", {
        email: email.trim(),
      });

      Alert.alert(
        "Code Sent!",
        "Please check your email inbox (and spam folder)."
      );
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Could not send code.";
      Alert.alert("Failed to Resend", errorMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              Enter the verification code sent to your email
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="8-character code"
                value={code}
                onChangeText={setCode}
                maxLength={8}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (loading || !email || !code) && styles.buttonDisabled,
              ]}
              onPress={handleVerify}
              disabled={loading || !email || !code}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Didn&apos;t receive the code?{" "}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <View style={styles.resendRow}>
                    <ActivityIndicator
                      size="small"
                      color="#f97316"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.linkText, { opacity: 0.7 }]}>
                      Sending...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.linkText}>Resend Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // gray-100
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827", // gray-900
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563", // gray-600
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151", // gray-700
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db", // gray-300
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  codeInput: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 18,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: "#f97316", // orange-500
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#4b5563",
  },
  linkText: {
    fontSize: 14,
    color: "#f97316",
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
