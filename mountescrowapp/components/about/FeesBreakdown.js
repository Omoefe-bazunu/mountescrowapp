// components/about/FeesBreakdown.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";

export default function FeesBreakdown() {
  const [showTable, setShowTable] = useState(false);
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
          between the buyer and seller at varying percentages, offering
          flexibility and fairness. Our pricing is among the most competitive in
          the industry.
        </Text>

        {/* Pricing Structure Toggle */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowTable(!showTable)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { fontFamily: Fonts.body }]}>
            {showTable ? "Hide" : "View"} Pricing Structure
          </Text>
          {showTable ? (
            <ChevronUp size={20} color="#010e5a" />
          ) : (
            <ChevronDown size={20} color="#010e5a" />
          )}
        </TouchableOpacity>

        {/* Pricing Table */}
        {showTable && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.headerCell]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Deal Value (₦)
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Buyer Fee
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Seller Fee
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell]}>
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Total Fee
                  </Text>
                </View>
                <View
                  style={[styles.tableCell, styles.headerCell, styles.wideCell]}
                >
                  <Text style={[styles.headerText, { fontFamily: Fonts.body }]}>
                    Strategic Rationale
                  </Text>
                </View>
              </View>

              {/* Table Body */}
              {pricingStructure.map((tier, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCell}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.range}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.buyerFee}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.sellerFee}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.totalFee}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.wideCell]}>
                    <Text style={[styles.cellText, { fontFamily: Fonts.body }]}>
                      {tier.rationale}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

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
          <Text style={styles.sectionTitle}>
            Disbursement options for sellers and brokers
          </Text>
          <Text style={[styles.paragraph, { fontFamily: Fonts.body }]}>
            When a transaction begins, sellers and brokers can choose how they
            would like to receive their funds. Once all terms are fulfilled and
            verified, Mountescrow credits the wallet of the seller. From there,
            the seller can easily request a withdrawal. Withdrawal processing
            follows the same timeline as standard transactions involving shared
            escrow fees. All agreed fees are deducted transparently, ensuring
            full accountability at every stage of the process.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#010e5a",
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#fff",
    marginBottom: 16,
  },
  bold: {
    fontWeight: "bold",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    maxWidth: 250,
  },
  toggleText: {
    fontSize: 16,
    color: "#010e5a",
    fontWeight: "600",
  },
  table: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 12,
  },
  tableCell: {
    width: 120,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  wideCell: {
    width: 250,
  },
  headerCell: {
    backgroundColor: "#F3F4F6",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#010e5a",
  },
  cellText: {
    fontSize: 14,
    color: "#374151",
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 16,
  },
  bullet: {
    fontSize: 16,
    color: "#fff",
    marginRight: 8,
    fontWeight: "bold",
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#fff",
    flex: 1,
  },
});
