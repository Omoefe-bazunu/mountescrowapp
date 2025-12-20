// components/about/FeeCalculatorSection.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Fonts } from "../../constants/Fonts";
import FeesBreakdown from "./FeesBreakdown";

const { width } = Dimensions.get("window");

export default function FeeCalculatorSection() {
  const [amount, setAmount] = useState("2000");
  const [buyerFee, setBuyerFee] = useState(0);
  const [sellerFee, setSellerFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [totalFeePercent, setTotalFeePercent] = useState(0);
  const [calculated, setCalculated] = useState(false);

  const calculateFees = () => {
    const dealValue = parseFloat(amount) || 0;
    let buyerFeePercent, sellerFeePercent, totalFeePercent;

    if (dealValue <= 1000000) {
      buyerFeePercent = 5;
      sellerFeePercent = 5;
      totalFeePercent = 10;
    } else if (dealValue <= 5000000) {
      buyerFeePercent = 2.5;
      sellerFeePercent = 2.5;
      totalFeePercent = 5;
    } else if (dealValue <= 50000000) {
      buyerFeePercent = 2;
      sellerFeePercent = 2;
      totalFeePercent = 4;
    } else if (dealValue <= 200000000) {
      buyerFeePercent = 1.5;
      sellerFeePercent = 1.5;
      totalFeePercent = 3;
    } else if (dealValue <= 1000000000) {
      buyerFeePercent = 1;
      sellerFeePercent = 1;
      totalFeePercent = 2;
    } else {
      buyerFeePercent = 0.5;
      sellerFeePercent = 0.5;
      totalFeePercent = 1;
    }

    setBuyerFee((dealValue * buyerFeePercent) / 100);
    setSellerFee((dealValue * sellerFeePercent) / 100);
    setTotalFee((dealValue * totalFeePercent) / 100);
    setTotalFeePercent(totalFeePercent);
    setCalculated(true);
  };

  return (
    <View>
      <ImageBackground
        source={{
          uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FhowMountescrowWorksImage.jpg?alt=media&token=cedd54b5-52ea-462e-9df5-363b79a82276",
        }}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Calculate Your Escrow Fee</Text>
            <Text style={[styles.subtitle, { fontFamily: Fonts.body }]}>
              Calculate the exact amount we are charging for helping you hold
              your funds until your transaction is completed.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontFamily: Fonts.body }]}>
                Amount to hold
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { fontFamily: Fonts.body }]}
                  placeholder="E.g. 2000.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={calculateFees}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { fontFamily: Fonts.body }]}>
                Calculate
              </Text>
            </TouchableOpacity>

            {calculated && totalFee > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={[styles.resultText, { fontFamily: Fonts.body }]}>
                  Buyer Fee: ₦{buyerFee.toLocaleString()}
                </Text>
                <Text style={[styles.resultText, { fontFamily: Fonts.body }]}>
                  Seller Fee: ₦{sellerFee.toLocaleString()}
                </Text>
                <Text style={[styles.resultText, { fontFamily: Fonts.body }]}>
                  Total Fee: ₦{totalFee.toLocaleString()} ({totalFeePercent}%)
                </Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* FeesBreakdown Section - Outside ImageBackground */}
      <FeesBreakdown />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    alignItems: width > 768 ? "flex-start" : "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    maxWidth: 450,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#010e5a",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  currencyBox: {
    width: 100,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  currency: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#FB923C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
  },
});
