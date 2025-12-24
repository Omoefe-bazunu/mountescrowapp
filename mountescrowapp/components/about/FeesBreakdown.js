// components/about/FeesBreakdown.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function FeesBreakdown() {
  const [inView, setInView] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(60));

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inView) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [inView]);

  const pricingStructure = [
    {
      range: "₦0 – ₦1M",
      buyerFee: "5%",
      sellerFee: "5%",
      totalFee: "10%",
      rationale:
        "Covers operational cost of small deals. High volume tier (freelancers, rentals, trade)",
    },
    {
      range: "₦1M – ₦5M",
      buyerFee: "2.5%",
      sellerFee: "2.5%",
      totalFee: "5%",
      rationale: "For micro-SMEs, auto dealers, service providers",
    },
    {
      range: "₦5M – ₦50M",
      buyerFee: "2%",
      sellerFee: "2%",
      totalFee: "4%",
      rationale: "Growing SMEs, professionals, car lots, building materials",
    },
    {
      range: "₦50M – ₦200M",
      buyerFee: "1.5%",
      sellerFee: "1.5%",
      totalFee: "3%",
      rationale: "Construction, mid-scale real estate, procurement",
    },
    {
      range: "₦200M – ₦1B",
      buyerFee: "1%",
      sellerFee: "1%",
      totalFee: "2%",
      rationale: "Government contractors, large estate projects",
    },
    {
      range: "₦1B+",
      buyerFee: "0.5%",
      sellerFee: "0.5%",
      totalFee: "1% (capped)",
      rationale: "Ultra-high-net-worth deals; reinforces trust & exclusivity",
    },
  ];

  const paymentOptions = [
    "Bank Transfer",
    "If agreed to pay all or some of the fee, it's automatically added to the purchase price of the item you are buying",
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Fee Breakdown</Text>
        <Text style={[styles.paragraph, { fontFamily: Fonts.body }]}>
          Every transaction on our platform is subject to a dynamic fee based on
          the total deal value. This fee covers processing, escrow, and
          disbursement services. It starts at{" "}
          <Text style={styles.bold}>10%</Text> for smaller deals and decreases
          to as low as <Text style={styles.bold}>1%</Text> for ultra-high-value
          transactions. The fee can be paid entirely by one party or split
          between the buyer and seller at varying percentages.
        </Text>

        {/* Pricing Table Card */}
        <View style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.headerRow]}>
                <View style={[styles.tableCell, styles.colRange]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Deal Value
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.colFee]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Buyer
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.colFee]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Seller
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.colFee]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Total
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.colRationale]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Strategic Rationale
                  </Text>
                </View>
              </View>

              {/* Table Body */}
              {pricingStructure.map((tier, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.colRange]}>
                    <Text
                      style={[
                        styles.cellText,
                        styles.blueText,
                        { fontFamily: Fonts.body },
                      ]}
                    >
                      {tier.range}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.colFee]}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.buyerFee}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.colFee]}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.sellerFee}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.colFee]}>
                    <Text
                      style={[
                        styles.cellText,
                        styles.bold,
                        { fontFamily: Fonts.body },
                      ]}
                    >
                      {tier.totalFee}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.colRationale]}>
                    <Text
                      style={[
                        styles.cellText,
                        styles.grayText,
                        { fontFamily: Fonts.body },
                      ]}
                    >
                      {tier.rationale}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Info Sections */}
        <View style={styles.infoContainer}>
          {/* Payment Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment options for buyers</Text>
            {paymentOptions.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.listText, { fontFamily: Fonts.body }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Disbursement Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disbursement for sellers</Text>
            <Text style={[styles.paragraph, { fontFamily: Fonts.body }]}>
              When a transaction begins, sellers and brokers can choose how they
              would like to receive their funds. Once all terms are fulfilled
              and verified, Mountescrow credits the wallet of the seller. From
              there, the seller can easily request a withdrawal.
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#010e5a",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  content: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    fontFamily: Fonts.heading, // Assuming you have a heading font
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 24,
  },
  bold: {
    fontWeight: "bold",
  },
  // Table Styles
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 40,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    alignItems: "stretch", // Ensures cells stretch to fill row height
  },
  tableCell: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  // Column Widths
  colRange: {
    width: 140,
  },
  colFee: {
    width: 80,
  },
  colRationale: {
    width: 250,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#010e5a",
  },
  cellText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  blueText: {
    color: "#010e5a",
    fontWeight: "600",
  },
  grayText: {
    color: "#64748B",
  },
  // Info Sections
  infoContainer: {
    gap: 16, // Works in newer React Native versions, fallback to marginTop in section if needed
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    fontFamily: Fonts.heading,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start", // Aligns bullet with top of text
    paddingRight: 8,
  },
  bullet: {
    fontSize: 20,
    color: "#fff",
    marginRight: 12,
    lineHeight: 24,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
    flex: 1, // Important: prevents text from overflowing screen width
  },
});
