import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Phone, Mail, MapPin } from "lucide-react-native";
import { Fonts } from "../../../constants/Fonts";

const contacts = [
  { Icon: Phone, text: "+2348087480502" },
  { Icon: Mail, text: "support@mountescrow.com" },
  { Icon: MapPin, text: "House A2, Basic Estate, Lokogoma,\nAbuja, Nigeria." },
];

export default function ContactUsPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Left */}
        <View style={styles.left}>
          <ImageBackground
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FcontactpageImage.jpg?alt=media&token=b99be386-f9d1-482b-970d-0b29bef72a5e",
            }}
            style={styles.bgImage}
          >
            <View style={styles.overlay} />
          </ImageBackground>
          <View style={[styles.content, { fontFamily: Fonts.body }]}>
            <Text style={[styles.title, { fontFamily: Fonts.body }]}>
              Contact Details
            </Text>
            <Text style={[styles.desc, { fontFamily: Fonts.body }]}>
              Get in touch with us using the following details or fill the form
              to leave a message. We love to hear from you.
            </Text>
            <View style={styles.icons}>
              {contacts.map(({ Icon, text }, i) => (
                <View key={i} style={styles.iconItem}>
                  <View style={styles.iconCircle}>
                    <Icon color="white" size={20} />
                  </View>
                  <Text style={[styles.iconText, { fontFamily: Fonts.body }]}>
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right */}
        <View style={styles.right}>
          <View style={styles.form}>
            {["Name", "Email", "Phone (Preferably WhatsApp)"].map(
              (label, i) => (
                <View key={i} style={styles.inputGroup}>
                  <Text style={[styles.label, { fontFamily: Fonts.body }]}>
                    {label}
                  </Text>
                  <TextInput
                    placeholder={
                      label === "Name"
                        ? "E.g. John Doe"
                        : label === "Email"
                        ? "E.g. johndoe@gmail.com"
                        : "E.g. +2349200399920"
                    }
                    style={[styles.input, { fontFamily: Fonts.body }]}
                  />
                </View>
              )
            )}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: Fonts.body }]}>
                Message
              </Text>
              <TextInput
                placeholder="Write your message here"
                multiline
                style={[
                  styles.input,
                  styles.textarea,
                  { fontFamily: Fonts.body },
                ]}
              />
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={[styles.buttonText, { fontFamily: Fonts.body }]}>
                Send Message
              </Text>
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
  buttonText: { color: "white", fontWeight: "500" },
});
