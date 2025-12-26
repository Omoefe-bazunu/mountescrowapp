import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function FeesBreakdown() {
  const [inView, setInView] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
          transactions.
        </Text>

        {/* Toggle Button */}
        <TouchableOpacity
          onPress={() => setIsOpen(!isOpen)}
          style={styles.toggleButton}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleButtonText}>
            {isOpen ? "Hide Pricing Structure" : "View Pricing Structure"}
          </Text>
          <Text style={styles.toggleIcon}>{isOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.tableWrapper}>
            {/* Visual Scroll Indicator */}
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>
                ↔ Swipe to view full table
              </Text>
            </View>

            <View style={styles.tableCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.tableInner}>
                  {/* Table Header */}
                  <View style={[styles.tableRow, styles.headerRow]}>
                    <View style={[styles.tableCell, styles.colRange]}>
                      <Text
                        style={[styles.headerText, { fontFamily: Fonts.body }]}
                      >
                        Deal Value
                      </Text>
                    </View>
                    <View style={[styles.tableCell, styles.colFee]}>
                      <Text
                        style={[styles.headerText, { fontFamily: Fonts.body }]}
                      >
                        Buyer
                      </Text>
                    </View>
                    <View style={[styles.tableCell, styles.colFee]}>
                      <Text
                        style={[styles.headerText, { fontFamily: Fonts.body }]}
                      >
                        Seller
                      </Text>
                    </View>
                    <View style={[styles.tableCell, styles.colFee]}>
                      <Text
                        style={[styles.headerText, { fontFamily: Fonts.body }]}
                      >
                        Total
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.colRationale,
                        styles.lastCell,
                      ]}
                    >
                      <Text
                        style={[styles.headerText, { fontFamily: Fonts.body }]}
                      >
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
                        <Text
                          style={[styles.cellText, { fontFamily: Fonts.body }]}
                        >
                          {tier.buyerFee}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.colFee]}>
                        <Text
                          style={[styles.cellText, { fontFamily: Fonts.body }]}
                        >
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
                      <View
                        style={[
                          styles.tableCell,
                          styles.colRationale,
                          styles.lastCell,
                        ]}
                      >
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
          </View>
        )}

        <View style={styles.infoContainer}>
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
    fontFamily: Fonts.heading,
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
  toggleButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    maxWidth: 260,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  toggleButtonText: {
    color: "#010e5a",
    fontSize: 15,
    fontWeight: "600",
  },
  toggleIcon: {
    color: "#010e5a",
    fontSize: 12,
  },
  tableWrapper: {
    marginBottom: 40,
  },
  scrollIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  scrollIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontStyle: "italic",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableInner: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
  },
  headerRow: {
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableCell: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  colRange: { width: 140 },
  colFee: { width: 90 },
  colRationale: { width: 320 },
  headerText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#010e5a",
    textTransform: "uppercase",
  },
  cellText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  blueText: {
    color: "#010e5a",
    fontWeight: "700",
  },
  grayText: {
    color: "#64748B",
  },
  infoContainer: {
    gap: 24,
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
    alignItems: "flex-start",
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
    flex: 1,
  },
});
