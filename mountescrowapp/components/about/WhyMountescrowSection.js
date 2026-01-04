// components/about/WhyMountescrowSection.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { Fonts } from "../../constants/Fonts";
import { AppText } from "../ui/AppText";

const { width } = Dimensions.get("window");

export default function WhyMountescrowSection() {
  const [inView, setInView] = useState(false);

  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(50));
  const [imageScale] = useState(() => new Animated.Value(0.8));

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
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [inView]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Text Section */}
        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AppText style={styles.title}>WHY USE MOUNTESCROW?</AppText>
          <AppText style={styles.subtitle}>
            WE PRIORITIZE TRUST, SECURITY, EFFICIENCY & RELIABILITY
          </AppText>
          <AppText style={[styles.paragraph, { fontFamily: Fonts.body }]}>
            We have collaborated with a reliable and trusted deposit money bank
            in Nigeria to provide you with a simple, transparent, and secured
            payment method for your transactions. Making it easy, convenient and
            safe to do business anywhere, even if you do not know or trust
            anyone.
          </AppText>
        </Animated.View>

        {/* Image Section */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Image
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FWHYMOUNT%20(1).jpeg?alt=media&token=20275213-d422-4fd4-b188-4f4f34f93977",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 20,
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
    color: "#010e5a",
    marginBottom: 16,
    textAlign: width > 768 ? "left" : "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FB923C",
    marginBottom: 16,
    textAlign: width > 768 ? "left" : "center",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    textAlign: width > 768 ? "left" : "center",
  },
  imageContainer: {
    width: width > 768 ? 450 : "100%",
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#010e5a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
