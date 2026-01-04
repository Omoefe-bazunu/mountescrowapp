import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { AppText } from "../ui/AppText";

const { width } = Dimensions.get("window");

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2Fwwhybg.jpg?alt=media&token=d6a2afc6-5d1b-4df1-ae0a-6c824b4ba714",
      }}
      style={styles.heroContainer}
      resizeMode="cover"
    >
      {/* Decorative Dots */}
      <View style={styles.dotsContainer}>
        <View
          style={[styles.dot, styles.dot2, { backgroundColor: colors.warning }]}
        />
        <View
          style={[styles.dot, styles.dot3, { backgroundColor: colors.warning }]}
        />
      </View>

      {/* Main Content Area */}
      <View style={[styles.heroContent, visible && styles.animateIn]}>
        <View style={styles.textContainer}>
          <AppText
            allowFontScaling={false}
            style={[styles.headline, { fontFamily: "Montaga" }]}
          >
            Every Transaction{"\n"}
            <AppText style={{ color: colors.warning, fontFamily: "Montaga" }}>
              Absolute Trust{"\n"}
            </AppText>
            <AppText style={{ color: "#fff", fontFamily: "Montaga" }}>
              Every time
            </AppText>
          </AppText>

          {/* <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard")}
            style={[styles.button, { backgroundColor: colors.warning }]}
            activeOpacity={0.8}
          >
            <AppText
              allowFontScaling={false}
              style={[
                styles.buttonText,
                {
                  fontFamily: "Montaga",
                  color: "white", // Ensures visibility in Dark Mode
                },
              ]}
            >
              Get Started
            </AppText>
          </TouchableOpacity> */}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    minHeight: 650, // Reduced height since video is removed
    paddingVertical: 80,
    justifyContent: "center",
  },
  dotsContainer: { ...StyleSheet.absoluteFillObject, pointerEvents: "none" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dot2: { position: "absolute", top: 120, right: 60 },
  dot3: { position: "absolute", bottom: 120, left: width * 0.2 },
  heroContent: {
    maxWidth: 1024,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    opacity: 0,
    transform: [{ translateY: 30 }],
  },
  animateIn: { opacity: 1, transform: [{ translateY: 0 }] },
  textContainer: {
    alignItems: "center",
    maxWidth: 768,
    alignSelf: "center",
  },
  headline: {
    color: "#fff",
    fontSize: 40, // Increased slightly for impact
    textAlign: "center",
    lineHeight: 48,
    fontWeight: "bold",
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
