import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContexts";

export default function EmailVerificationBanner() {
  const { user, isEmailVerified, loading } = useAuth();
  const router = useRouter();

  // Don't show anything if loading, no user, or already verified
  if (loading || !user || isEmailVerified) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-unread" size={22} color="#fff" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Check your inbox for the verification code.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/verify-account")}
      >
        <Text style={styles.buttonText}>Verify Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ef4444", // Destructive red
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
