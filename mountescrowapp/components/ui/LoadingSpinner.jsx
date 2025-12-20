import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export function LoadingSpinner({ size = "large", color = "#1E3A8A" }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
