// sections/ConfidenceSection.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Fonts } from "../../constants/Fonts";

const screenWidth = Dimensions.get("window").width;

export default function ConfidenceSection() {
  const [cardsInView, setCardsInView] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartbeatAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const timer = setTimeout(() => setCardsInView(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [heartbeatAnim]);

  useEffect(() => {
    if (cardsInView) {
      cardAnims.forEach((anim, idx) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: idx * 200,
          useNativeDriver: true,
        }).start()
      );
    }
  }, [cardsInView]);

  const cards = [
    {
      title: "Shop securely, even with new sellers.",
      text: "Receive exactly what you pay for, while staying protected from fraud and false promises.",
    },
    {
      title: "Not satisfied with a delivery?",
      text: "Get compensated promptly, with disputes handled efficiently to protect your confidence.",
    },
    {
      title: "Boost buyer confidence",
      text: "Close deals more efficiently.",
    },
  ];

  return (
    <View style={styles.confidenceContainer}>
      <View style={styles.section}>
        <Animated.Text
          style={[
            styles.heading,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          SEAL EVERY DEAL WITH TOTAL CONFIDENCE
        </Animated.Text>
        <Animated.Text
          style={[
            styles.paragraph,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              marginTop: 16,
              fontFamily: Fonts.body,
            },
          ]}
        >
          Whether you are buying, hiring, renting, or exchanging value in any
          form, Mountescrow guarantees trust through impartial protection.
        </Animated.Text>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginTop: 24,
          }}
        >
          <TouchableOpacity style={[styles.button, styles.confidenceButton]}>
            <Text style={[styles.buttonText, { fontFamily: Fonts.body }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.cardsGrid}>
          {cards.map((card, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.card,
                {
                  opacity: cardAnims[idx],
                  transform: [
                    {
                      translateY: cardAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.cardTitle, { fontFamily: Fonts.body }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardText, { fontFamily: Fonts.body }]}>
                {card.text}
              </Text>
            </Animated.View>
          ))}
        </View>
        <View style={styles.imageWrapper}>
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ scale: heartbeatAnim }] },
            ]}
          >
            <Image
              source={{
                uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2Fconfid%20(1).png?alt=media&token=bc947be7-240f-4c1b-9254-1799848a907e",
              }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  confidenceContainer: { backgroundColor: "#fff", paddingBottom: 80 },
  section: {
    paddingVertical: 64,
    alignItems: "center",
    paddingHorizontal: 16,
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    color: "#010e5a",
  },
  paragraph: {
    textAlign: "center",
    maxWidth: 768,
    fontSize: 16,
    lineHeight: 24,
    color: "#010e5a",
  },
  button: {
    backgroundColor: "#FB923C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confidenceButton: { backgroundColor: "#FB923C" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 32,
    marginTop: 48,
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#010e5a",
    padding: 24,
    borderRadius: 8,
    width: screenWidth > 768 ? 300 : "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { color: "#E5E7EB", fontWeight: "800", marginBottom: 8 },
  cardText: { color: "#E5E7EB" },
  imageWrapper: { height: 200 },
  imageContainer: { width: 300, height: 300 },
  image: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 8,
    borderColor: "#010e5a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
