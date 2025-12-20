// sections/BuySection.js
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

const screenWidth = Dimensions.get("window").width;

export default function BuySection() {
  const [buyInView, setBuyInView] = useState(false);

  const [buyFadeAnim] = useState(() => new Animated.Value(0));
  const [buyCardAnims] = useState(() =>
    Array(3)
      .fill()
      .map(() => new Animated.Value(0))
  );

  useEffect(() => {
    const timer = setTimeout(() => setBuyInView(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (buyInView) {
      Animated.timing(buyFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      buyCardAnims.forEach((anim, idx) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          delay: idx * 200,
          useNativeDriver: true,
        }).start()
      );
    }
  }, [buyInView]);

  const buyCards = [
    {
      title: "PHYSICAL PRODUCTS",
      items: [
        "Electronics & Gadgets",
        "Mobile Phones & Accessories",
        "Home Appliances",
        "Fashion & Clothing Items",
        "Other Everyday Products",
      ],
      image:
        "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FPHYS.png?alt=media&token=a2a12a27-9a0e-447e-84ba-692fdf4af0aa",
    },
    {
      title: "DIGITAL PRODUCTS",
      items: [
        "Web Development & Software Services",
        "Design & Creative Projects",
        "Online Courses (PDF, Video, eLearning)",
        "Templates & Licensed Digital Goods",
        "Downloadable Content & Resources",
      ],
      image:
        "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FSER.jpeg?alt=media&token=6460acfb-9d38-4993-aec8-c58e6b26a2cc",
    },
    {
      title: "SERVICES",
      items: [
        "Freelance & Contract Work",
        "Professional Services",
        "Consulting, Advisory & Business Solutions",
        "Real Estate Transactions & Payments",
        "Vendor Bookings & Event Services",
      ],
      image:
        "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FDIG.jpeg?alt=media&token=301e7505-b924-4537-a9c1-1f360edb9e6f",
    },
  ];

  return (
    <View style={styles.buyContainer}>
      <View style={styles.buySection}>
        <Animated.Text
          style={[
            styles.buyTitle,
            {
              opacity: buyFadeAnim,
              transform: [
                {
                  translateY: buyFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Goods, Services, and More, All Safely on Mountescrow.
        </Animated.Text>
        <Animated.Text
          style={[
            styles.buySubtitle,
            {
              opacity: buyFadeAnim,
              fontFamily: Fonts.body,
              transform: [
                {
                  translateY: buyFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
              marginTop: 16,
            },
          ]}
        >
          Whether it is products, services, or digital assets, Mountescrow
          provides a safe, trusted space for every transaction.
        </Animated.Text>
        <View style={styles.buyGrid}>
          {buyCards.map((card, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.buyCard,
                {
                  opacity: buyCardAnims[idx],
                  transform: [
                    {
                      translateY: buyCardAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={{ uri: card.image }}
                style={styles.buyImage}
                resizeMode="cover"
              />
              <View style={styles.buyCardContent}>
                <Text style={styles.buyCardTitle}>{card.title}</Text>
                {card.items.map((item, i) => (
                  <Text
                    key={i}
                    style={[styles.buyItem, { fontFamily: Fonts.body }]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buyContainer: { backgroundColor: "#010e5a", paddingVertical: 80 },
  buySection: {
    paddingHorizontal: 16,
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  buyTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 16,
  },
  buySubtitle: {
    color: "#fff",
    textAlign: "center",
    maxWidth: 768,
    fontSize: 16,
    marginBottom: 48,
  },
  buyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 32,
  },
  buyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    width: screenWidth > 768 ? 350 : "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  buyImage: { width: "100%", height: 200 },
  buyCardContent: { padding: 24 },
  buyCardTitle: {
    color: "#010e5a",
    fontWeight: "600",
    fontSize: 20,
    marginBottom: 12,
  },
  buyItem: { color: "#4B5563", fontSize: 14, marginBottom: 4 },
});
