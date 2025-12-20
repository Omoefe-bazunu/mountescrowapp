// app/about.js or app/index.js (depending on your setup)
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import WhyMountescrowSection from "../../../components/about/WhyMountescrowSection";
import OurStorySection from "../../../components/about/OurStorySection";
import ProductsSection from "../../../components/about/ProductsSection";
import FeeCalculatorSection from "../../../components/about/FeesCalculatorSection";
import PoliciesSection from "../../../components/about/PoliciesSection";

export default function About() {
  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <WhyMountescrowSection />
        <OurStorySection />
        <ProductsSection />
        <FeeCalculatorSection />
        <PoliciesSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flex: 1 },
});
