// sections/UseCasesSection.js
import React, { useEffect, useState } from "react";
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

export default function UseCasesSection() {
  const [useCasesInView, setUseCasesInView] = useState(false);

  const [useCasesAnim1] = useState(() => new Animated.Value(0));
  const [useCasesAnim2] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => setUseCasesInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (useCasesInView) {
      Animated.stagger(200, [
        Animated.timing(useCasesAnim1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(useCasesAnim2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [useCasesInView]);

  const useCases = [
    {
      image:
        "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FGemini_Generated_Image_q5ob7rq5ob7rq5ob%20(1).png?alt=media&token=a5f98888-78b3-40cd-b8c5-3a2a9f4a63f4",
      title: "Escrow Payment Invite",
      text: "Simply set up and share a payment link with the buyer. Mountescrow takes care of the rest - receive and secure the funds until the buyer and the seller meet transaction terms.",
      buttonText: "Create Payment Link",
      onPress: () => {},
    },
    {
      image:
        "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FAPPI.jpeg?alt=media&token=e1b8f446-5018-4505-bc32-5b847caea73e",
      title: "B2B ESCROW API INTEGRATION",
      text: "Integrate Mountescrow escrow service into your business platform to securely safeguard funds until specific conditions are met. Our B2B API is highly customizable to meet unique needs of diverse businesses and scalable to accommodate growth.",
      buttonText: "Coming Soon",
      disabled: true,
    },
  ];

  return (
    <View style={styles.useCasesContainer}>
      <Animated.Text
        style={[
          styles.useCasesTitle,
          {
            opacity: useCasesAnim1,
            transform: [
              {
                translateY: useCasesAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        PRODUCTS OF MOUNTESCROW
      </Animated.Text>
      <View style={styles.useCasesGrid}>
        {useCases.map((item, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.useCasesCard,
              {
                opacity: idx === 0 ? useCasesAnim1 : useCasesAnim2,
                transform: [
                  {
                    scale: (idx === 0
                      ? useCasesAnim1
                      : useCasesAnim2
                    ).interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.useCasesImageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.useCasesImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.useCasesCardTitle}>{item.title}</Text>
            <Text style={[styles.useCasesCardText, { fontFamily: Fonts.body }]}>
              {item.text}
            </Text>
            <TouchableOpacity
              style={[
                styles.useCasesButton,
                item.disabled && styles.useCasesComingSoon,
              ]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <Text
                style={[styles.useCasesButtonText, { fontFamily: Fonts.body }]}
              >
                {item.buttonText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  useCasesContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 64,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  useCasesTitle: {
    color: "#010e5a",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 24,
  },
  useCasesGrid: {
    width: "100%",
    maxWidth: 1024,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
  },
  useCasesCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: screenWidth > 768 ? "48%" : "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  useCasesImageContainer: {
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: "#F9FAFB",
  },
  useCasesImage: { width: "100%", height: "100%" },
  useCasesCardTitle: {
    color: "#010e5a",
    fontWeight: "600",
    fontSize: 20,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  useCasesCardText: {
    color: "#334155",
    fontSize: 14,
    flex: 1,
    marginBottom: 8,
  },
  useCasesButton: {
    backgroundColor: "#FB923C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  useCasesComingSoon: { backgroundColor: "#6B7280" },
  useCasesButtonText: { color: "#fff", fontWeight: "600" },
});
