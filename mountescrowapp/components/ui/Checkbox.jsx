import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

export function Checkbox({ label, checked, onCheckedChange, error }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, checked && styles.checked]}
        onPress={() => onCheckedChange(!checked)}
        activeOpacity={0.7}
      >
        {checked && <Check size={16} color="#fff" strokeWidth={3} />}
      </TouchableOpacity>
      {typeof label === "string" ? (
        <Text style={styles.labelText}>{label}</Text>
      ) : (
        <View style={styles.labelContainer}>{label}</View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginHorizontal: "auto",
    gap: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4F46E5",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: "#4F46E5",
  },
  labelText: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
    marginHorizontal: "auto",
  },
  labelContainer: {
    flex: 1,
  },
  error: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
