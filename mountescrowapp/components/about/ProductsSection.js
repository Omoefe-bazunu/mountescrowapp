// components/about/ProductsSection.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";
import { AppText } from "../ui/AppText";

const { width } = Dimensions.get("window");

export default function ProductsSection() {
  const [inView, setInView] = useState(false);

  const [textFadeAnim] = useState(() => new Animated.Value(0));
  const [iconFadeAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inView) {
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [inView]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Text Block */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: textFadeAnim,
              transform: [
                {
                  translateY: textFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AppText style={styles.title}>
            MOUNTESCROW. BUILT FOR TRUST.{" "}
            <AppText style={styles.titleHighlight}>
              SECURE EVERY TRANSACTION.
            </AppText>
          </AppText>
          <AppText style={[styles.paragraph, { fontFamily: Fonts.body }]}>
            We serve as a trusted third party to guarantee that transaction
            terms are upheld. With Mountescrow, you can have complete confidence
            that everyone involved gets what they expect.
          </AppText>
        </Animated.View>

        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconFadeAnim,
              transform: [
                {
                  scale: iconFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <ShieldCheck size={80} color="#010e5a" />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    flexDirection: width > 768 ? "row" : "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 32,
  },
  textSection: {
    flex: 1,
    maxWidth: 672,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FB923C",
    marginBottom: 24,
    textAlign: width > 768 ? "left" : "center",
  },
  titleHighlight: {
    color: "#010e5a",
  },
  paragraph: {
    fontSize: 18,
    lineHeight: 28,
    color: "#334155",
    textAlign: width > 768 ? "left" : "center",
  },
  iconContainer: {
    width: 256,
    height: 256,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 8,
    borderColor: "#FB923C",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
