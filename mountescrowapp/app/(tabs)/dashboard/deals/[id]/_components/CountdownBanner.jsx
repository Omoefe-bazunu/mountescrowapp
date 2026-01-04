import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../../../../src/api/apiClient";
import { AppText } from "../../../../../../components/ui/AppText";

export function CountdownBanner({
  milestone,
  dealId,
  milestoneIndex,
  isBuyer,
  onUpdate,
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!milestone.countdownActive || !milestone.countdownExpiresAt) return;

    const updateCountdown = () => {
      const now = Date.now();
      const expiresAt = new Date(milestone.countdownExpiresAt).getTime();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setTimeLeft(null);
        if (!hasTriggered.current) {
          hasTriggered.current = true;
          handleAutoApprove();
        }
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [milestone.countdownActive, milestone.countdownExpiresAt]);

  const handleAutoApprove = async () => {
    try {
      await apiClient.post(
        `/deals/${dealId}/milestones/${milestoneIndex}/auto-approve`
      );
      onUpdate();
    } catch (error) {
      console.error(
        "Auto-approve failed:",
        error.response?.data || error.message
      );
    }
  };

  // FIXED: "On Hold" logic now perfectly replicates web version
  if (
    milestone.countdownCancelledAt &&
    !milestone.countdownActive &&
    milestone.status === "Submitted for Approval"
  ) {
    return (
      <View style={[styles.banner, styles.holdBanner]}>
        <Ionicons name="pause-circle" size={20} color="#92400e" />
        <AppText style={styles.holdText}>
          <AppText style={{ fontWeight: "bold" }}>Countdown on Hold.</AppText>{" "}
          Kindly review the milestone and take action.
        </AppText>
      </View>
    );
  }

  if (!milestone.countdownActive || !timeLeft) return null;

  return (
    <View style={[styles.banner, styles.activeBanner]}>
      <View style={styles.timerRow}>
        <Ionicons name="time" size={18} color="#1d4ed8" />
        <AppText style={styles.timerText}>
          Auto-Approval: {timeLeft.hours > 0 && `${timeLeft.hours}h `}
          {timeLeft.minutes}m {timeLeft.seconds}s remaining
        </AppText>
      </View>
      {isBuyer && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={async () => {
            setCancelling(true);
            try {
              await apiClient.post(
                `/deals/${dealId}/milestones/${milestoneIndex}/cancel-countdown`
              );
              onUpdate();
            } catch (e) {
              Alert.alert("Error", "Failed to cancel");
            } finally {
              setCancelling(false);
            }
          }}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#1d4ed8" />
          ) : (
            <AppText style={styles.cancelText}>Stop</AppText>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  activeBanner: { backgroundColor: "#eff6ff", borderColor: "#3b82f6" },
  holdBanner: { backgroundColor: "#fffbeb", borderColor: "#f59e0b" },
  timerRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  timerText: {
    color: "#1e40af",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 12,
  },
  holdText: { color: "#92400e", marginLeft: 8, fontSize: 12, flex: 1 },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  cancelText: { color: "#1d4ed8", fontWeight: "bold", fontSize: 11 },
});
