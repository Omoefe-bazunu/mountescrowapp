// Home.js
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import HeroSection from "../../components/home/HeroSection";
import ConfidenceSection from "../../components/home/ConfidenceSection";
import HowItWorksSection from "../../components/home/HowItWorksSection";
import BuySection from "../../components/home/BuySection";
import UseCasesSection from "../../components/home/UseCasesSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import FAQSection from "../../components/home/FAQSection";

export default function Home() {
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        <ConfidenceSection />
        <HowItWorksSection />
        <BuySection />
        <UseCasesSection />
        <TestimonialsSection />
        <FAQSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flex: 1 },
});
