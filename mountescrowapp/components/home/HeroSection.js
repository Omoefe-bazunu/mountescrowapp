// sections/HeroSection.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Fonts } from "../../constants/Fonts";

const { width } = Dimensions.get("window");
const youtubeVideoId = "DaRXece2ItE";
const getThumbnailUrl = (id) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = useCallback(() => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
    Linking.openURL(youtubeUrl).catch((err) =>
      console.error("Could not open YouTube link", err)
    );
  }, []);

  const VideoPlayerComponent = () => (
    <TouchableOpacity
      style={styles.iframeContainer}
      activeOpacity={0.8}
      onPress={handlePlay}
    >
      <Image
        source={{ uri: getThumbnailUrl(youtubeVideoId) }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
      <View style={styles.playButtonContainer}>
        <MaterialIcons name="play-arrow" size={50} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2Fwwhybg.jpg?alt=media&token=d6a2afc6-5d1b-4df1-ae0a-6c824b4ba714",
      }}
      style={styles.heroContainer}
      resizeMode="cover"
    >
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
      <View style={[styles.heroContent, visible && styles.animateIn]}>
        <View style={styles.textContainer}>
          <Text style={styles.headline}>
            Every Transaction{"\n"}
            <Text style={styles.orange}>Absolute Trust{"\n"}</Text>
            <Text style={styles.white}>Every time</Text>
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard")}
            style={styles.button}
          >
            <Text style={[styles.buttonText, { fontFamily: Fonts.body }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.videoContainer}>
          <VideoPlayerComponent />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    minHeight: 600,
    paddingVertical: 60,
    justifyContent: "center",
  },
  dotsContainer: { ...StyleSheet.absoluteFillObject, pointerEvents: "none" },
  dot: { width: 8, height: 8, backgroundColor: "#FB923C", borderRadius: 4 },
  dot2: { position: "absolute", top: 160, right: 80 },
  dot3: { position: "absolute", bottom: 160, left: width * 0.25 },
  heroContent: {
    maxWidth: 1024,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    opacity: 0,
    transform: [{ translateY: 30 }],
  },
  animateIn: { opacity: 1, transform: [{ translateY: 0 }] },
  textContainer: { alignItems: "center", maxWidth: 768 },
  headline: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 36,
    textAlign: "center",
    lineHeight: 44,
  },
  orange: { color: "#FB923C" },
  white: { color: "#fff" },
  button: {
    backgroundColor: "#FB923C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  videoContainer: { width: "100%", maxWidth: 768, marginTop: 16 },
  iframeContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 8,
    borderColor: "#fff",
  },
  thumbnailImage: { ...StyleSheet.absoluteFillObject },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
