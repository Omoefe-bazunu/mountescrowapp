// sections/HowItWorksSection.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import {
  Handshake,
  ShieldCheck,
  Truck,
  ThumbsUp,
  HandCoins,
} from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";
import { AppText } from "../ui/AppText";

const { width } = Dimensions.get("window");

export default function HowItWorksSection() {
  const [howInView, setHowInView] = useState(false);

  const [howFadeAnims] = useState(() =>
    Array(5)
      .fill()
      .map(() => new Animated.Value(0))
  );
  const [howScaleAnims] = useState(() =>
    Array(5)
      .fill()
      .map(() => new Animated.Value(1))
  );

  useEffect(() => {
    const timer = setTimeout(() => setHowInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (howInView) {
      howFadeAnims.forEach((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: 300 + i * 200,
          useNativeDriver: true,
        }).start()
      );
      howScaleAnims.forEach((anim) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.15,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start()
      );
    }
  }, [howInView]);

  const steps = [
    {
      Icon: Handshake,
      main: "Terms are Set",
      text: "Buyer and Seller agree on transaction details and conditions.",
    },
    {
      Icon: ShieldCheck,
      main: "Payment is Secured",
      text: "Buyer deposits payment into Mountescrow's secure account.",
    },
    {
      Icon: Truck,
      main: "Order is Delivered",
      text: "Seller fulfills and delivers the product or service as agreed.",
    },
    {
      Icon: ThumbsUp,
      main: "Order is Approved",
      text: "Buyer reviews and confirms satisfaction with the order.",
    },
    {
      Icon: HandCoins,
      main: "Payment is Released",
      text: "Mountescrow releases funds to the seller—deal complete!",
    },
  ];

  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FhowMountescrowWorksImage.jpg?alt=media&token=cedd54b5-52ea-462e-9df5-363b79a82276",
      }}
      style={styles.howBg}
      resizeMode="cover"
    >
      <View style={styles.howSection}>
        <AppText style={styles.howTitle}>HOW MOUNTESCROW WORKS</AppText>
        <AppText style={[styles.howSubtitle, { fontFamily: Fonts.body }]}>
          Each transaction follows a secure, transparent, and automated flow,
          protecting both buyer and seller every step of the way.
        </AppText>
        <View style={styles.howGrid}>
          {steps.map((step, i) => {
            const Icon = step.Icon;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.howCard,
                  {
                    opacity: howFadeAnims[i],
                    transform: [
                      {
                        translateY: howFadeAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.iconCircle,
                    { transform: [{ scale: howScaleAnims[i] }] },
                  ]}
                >
                  <View style={styles.number}>
                    <AppText style={styles.numberText}>{i + 1}</AppText>
                  </View>
                  <Icon size={40} color="#fff" />
                </Animated.View>
                <AppText
                  style={[
                    styles.howMain,
                    { fontFamily: Fonts.body, fontWeight: "bold" },
                  ]}
                >
                  {step.main}
                </AppText>
                <AppText style={[styles.howText, { fontFamily: Fonts.body }]}>
                  {step.text}
                </AppText>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  howBg: { width: "100%" },
  howSection: {
    paddingTop: 64,
    paddingBottom: 80,
    paddingHorizontal: 16,
    alignItems: "center",
    maxWidth: 1280,
    marginHorizontal: "auto",
  },
  howTitle: {
    color: "#010e5a",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 16,
  },
  howSubtitle: {
    color: "#374151",
    textAlign: "center",
    maxWidth: 672,
    marginBottom: 40,
    fontSize: 16,
  },
  howGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
  },
  howCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    width: width > 1024 ? 200 : width > 768 ? 160 : "45%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: {
    backgroundColor: "#010e5a",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#fff",
  },
  number: {
    position: "absolute",
    top: -12,
    left: -4,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: { color: "#1E40AF", fontWeight: "bold", fontSize: 18 },
  howMain: {
    color: "#010e5a",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  howText: { color: "#010e5a", fontSize: 13, textAlign: "center" },
});
