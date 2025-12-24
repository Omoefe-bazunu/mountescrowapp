import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView, // ✅ Imported ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import FAQSection from "../../../../components/home/FAQSection";
import { Ionicons } from "@expo/vector-icons";

const Faqs = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/about")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* ✅ Wrapped content in ScrollView */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // Adds space at the bottom
      >
        <FAQSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
  },
});

export default Faqs;
