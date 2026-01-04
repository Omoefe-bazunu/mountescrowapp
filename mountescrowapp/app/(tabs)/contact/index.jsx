import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Phone, Mail, MapPin } from "lucide-react-native";
import { Fonts } from "../../../constants/Fonts";
import { sendContactMessage } from "../../../src/services/contact.service";
import { AppText } from "../../../components/ui/AppText";

const contacts = [
  { Icon: Phone, text: "+2348087480502" },
  { Icon: Mail, text: "support@mountescrow.com" },
  {
    Icon: MapPin,
    text: "House A2, Basic Estate, Lokogoma,\nAbuja, Nigeria.",
  },
];

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Helper to update form state
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }

    setLoading(true);

    try {
      // Call the service to send data
      await sendContactMessage(formData);

      Alert.alert("Message Sent!", "We'll get back to you soon.", [
        {
          text: "OK",
          onPress: () =>
            setFormData({ name: "", email: "", phone: "", message: "" }),
        },
      ]);
    } catch (err) {
      console.error("Contact submission error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to send message";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper to map UI labels to state keys
  const getFieldKey = (label) => {
    if (label === "Name") return "name";
    if (label === "Email") return "email";
    return "phone";
  };

  const getPlaceholder = (label) => {
    if (label === "Name") return "E.g. John Doe";
    if (label === "Email") return "E.g. johndoe@gmail.com";
    return "E.g. +2349200399920";
  };

  const getKeyboardType = (label) => {
    if (label === "Email") return "email-address";
    if (label.includes("Phone")) return "phone-pad";
    return "default";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Left Section (Contact Info) */}
        <View style={styles.left}>
          <ImageBackground
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FcontactpageImage.jpg?alt=media&token=b99be386-f9d1-482b-970d-0b29bef72a5e",
            }}
            style={styles.bgImage}
          >
            <View style={styles.overlay} />
          </ImageBackground>
          <View style={styles.content}>
            <AppText style={[styles.title, { fontFamily: Fonts.body }]}>
              Contact Details
            </AppText>
            <AppText style={[styles.desc, { fontFamily: Fonts.body }]}>
              Get in touch with us using the following details or fill the form
              to leave a message. We love to hear from you.
            </AppText>
            <View style={styles.icons}>
              {contacts.map(({ Icon, text }, i) => (
                <View key={i} style={styles.iconItem}>
                  <View style={styles.iconCircle}>
                    <Icon color="white" size={20} />
                  </View>
                  <AppText
                    style={[styles.iconText, { fontFamily: Fonts.body }]}
                  >
                    {text}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right Section (Form) */}
        <View style={styles.right}>
          <View style={styles.form}>
            {["Name", "Email", "Phone (Preferably WhatsApp)"].map(
              (label, i) => (
                <View key={i} style={styles.inputGroup}>
                  <AppText style={[styles.label, { fontFamily: Fonts.body }]}>
                    {label}
                  </AppText>
                  <TextInput
                    placeholder={getPlaceholder(label)}
                    style={[styles.input, { fontFamily: Fonts.body }]}
                    value={formData[getFieldKey(label)]}
                    onChangeText={(text) =>
                      handleChange(getFieldKey(label), text)
                    }
                    keyboardType={getKeyboardType(label)}
                    autoCapitalize={label === "Email" ? "none" : "words"}
                  />
                </View>
              )
            )}

            <View style={styles.inputGroup}>
              <AppText style={[styles.label, { fontFamily: Fonts.body }]}>
                Message
              </AppText>
              <TextInput
                placeholder="Write your message here"
                multiline
                style={[
                  styles.input,
                  styles.textarea,
                  { fontFamily: Fonts.body },
                ]}
                value={formData.message}
                onChangeText={(text) => handleChange("message", text)}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <AppText
                  style={[styles.buttonText, { fontFamily: Fonts.body }]}
                >
                  Send Message
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  card: {
    flexDirection: "column",
    maxWidth: 1024,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
    flex: 1,
  },
  left: {
    flex: 1,
    position: "relative",
    paddingVertical: 48,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  bgImage: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,50,0.8)", // Matches web design overlay
  },
  content: { position: "relative", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  desc: {
    maxWidth: 300,
    marginBottom: 24,
    textAlign: "center",
    color: "#e0e7ff",
    fontSize: 14,
  },
  icons: { gap: 24, alignItems: "center" },
  iconItem: { alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconText: { color: "white", textAlign: "center", fontSize: 14 },
  right: { flex: 1, paddingVertical: 32, paddingHorizontal: 32 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, color: "#010e5a" },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { color: "white", fontWeight: "500" },
});
