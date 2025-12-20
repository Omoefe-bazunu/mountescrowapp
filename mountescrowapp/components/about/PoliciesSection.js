// components/about/PoliciesSection.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function PoliciesSection() {
  const [activeTab, setActiveTab] = useState("Refund & Privacy Policy");

  const policyData = {
    "Refund & Privacy Policy": {
      summary:
        "Mountescrow does not sell or share user data with third parties. We respect your privacy and uphold data protection regulations. We also have a flexible Refund policy that allows for compensation of either parties to a transaction in the event of a dispute.",
      pdfUrl: "https://mountescrow.com/policies/refund-privacy.pdf", // Replace with actual URL
    },
    "Terms of Use": {
      summary:
        "These Terms of Use govern your use and participation in Mountescrow's services. Please read carefully to understand your rights and obligations when using our platform.",
      pdfUrl: "https://mountescrow.com/policies/terms-of-use.pdf", // Replace with actual URL
    },
  };

  const handleOpenPDF = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL: " + url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Policies & Terms</Text>
        <Text style={[styles.subtitle, { fontFamily: Fonts.body }]}>
          Our policies and terms of use are designed to be fair, transparent,
          and efficient.
        </Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {Object.keys(policyData).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive]}
              onPress={() => setActiveTab(key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { fontFamily: Fonts.body },
                  activeTab === key && styles.tabTextActive,
                ]}
              >
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{activeTab}</Text>
          <Text style={[styles.cardText, { fontFamily: Fonts.body }]}>
            {policyData[activeTab].summary}
          </Text>

          {policyData[activeTab].pdfUrl && (
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => handleOpenPDF(policyData[activeTab].pdfUrl)}
            >
              <Text style={[styles.pdfButtonText, { fontFamily: Fonts.body }]}>
                View Full {activeTab} PDF
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 896,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#010e5a",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 32,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  tabActive: {
    backgroundColor: "#010e5a",
    borderColor: "#010e5a",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#010e5a",
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 24,
  },
  pdfButton: {
    backgroundColor: "#FB923C",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
