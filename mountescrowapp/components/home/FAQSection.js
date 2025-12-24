// sections/FAQSection.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Fonts } from "../../constants/Fonts";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = {
    GENERAL: [
      {
        question: "What is Mountescrow?",
        answer:
          "Mountescrow is a digital escrow solution designed to enhance trust and security in digital transactions. It offers escrow services that protect both buyers and sellers.",
      },
      {
        question: "How does Mountescrow Work?",
        answer:
          "Mountescrow holds funds securely between buyer and seller until both parties agree to release them. It's a transparent and safe way to transact.",
      },
      {
        question: "How is my money with Mountescrow secured?",
        answer:
          "Funds are held in a secure escrow account and only released once both parties agree. We work with licensed financial partners and secure systems to safeguard all transactions.",
      },
    ],
    PRICING: [
      {
        question: "Is Mountescrow free?",
        answer:
          "Creating an account is free. A small escrow fee is applied only when you use the platform for transactions. You'll see this clearly before committing to payment.",
      },
    ],
    PRIVACY: [
      {
        question: "Do you sell user data?",
        answer:
          "No. Mountescrow does not sell or share user data with third parties. We respect your privacy and uphold data protection regulations.",
      },
    ],
    "DISPUTE RESOLUTION": [
      {
        question: "What happens if there's a dispute?",
        answer:
          "If either party is unsatisfied, Mountescrow's resolution center will intervene and process a refund or release based on evidence and agreement terms.",
      },
    ],
  };

  const toggleFaq = (idx) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <View style={styles.faqContainer}>
      <Text style={styles.faqTitle}>FREQUENTLY ASKED QUESTIONS</Text>
      <View style={styles.faqTabs}>
        {Object.keys(faqData).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.faqTab, activeTab === cat && styles.faqTabActive]}
            onPress={() => {
              setActiveTab(cat);
              setOpenIndex(null);
            }}
          >
            <Text
              style={[
                styles.faqTabText,
                { fontFamily: Fonts.body },
                activeTab === cat && styles.faqTabTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.faqList}>
        {faqData[activeTab].map((item, idx) => (
          <View key={idx} style={styles.faqItem}>
            <TouchableOpacity
              onPress={() => toggleFaq(idx)}
              style={styles.faqQuestion}
            >
              <Text
                style={[
                  styles.faqQuestionText,
                  { fontFamily: Fonts.body, fontWeight: "bold" },
                ]}
              >
                {item.question}
              </Text>
              <Text style={[styles.faqIcon, { fontFamily: Fonts.body }]}>
                {openIndex === idx ? "−" : "+"}
              </Text>
            </TouchableOpacity>
            {openIndex === idx && (
              <View style={styles.faqAnswer}>
                <Text
                  style={[styles.faqAnswerText, { fontFamily: Fonts.body }]}
                >
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  faqContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  faqTitle: {
    color: "#010e5a",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 32,
  },
  faqTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 48,
  },
  faqTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqTabActive: { backgroundColor: "#010e5a" },
  faqTabText: { color: "#010e5a", fontWeight: "bold" },
  faqTabTextActive: { color: "#fff" },
  faqList: { maxWidth: 768, width: "100%" },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestionText: { color: "#010e5a", fontWeight: "600", flex: 1 },
  faqIcon: { fontSize: 24, fontWeight: "bold", color: "#010e5a" },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
  faqAnswerText: { color: "#6B7280", fontSize: 14 },
});
