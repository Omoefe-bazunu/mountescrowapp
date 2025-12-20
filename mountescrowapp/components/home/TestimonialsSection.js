// sections/TestimonialsSection.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import { Star, PlusCircle, X } from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";

export default function TestimonialsSection() {
  const [testimonialsInView, setTestimonialsInView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    authorTitle: "",
    review: "",
    rating: 5,
    photo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [slideAnim] = useState(() => new Animated.Value(0));
  const [nextSlideAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setTimeout(() => setTestimonialsInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (testimonials.length > 1 && testimonialsInView) {
      const timer = setTimeout(() => {
        setIsSliding(true);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(nextSlideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentIndex((prev) => (prev + 1) % testimonials.length);
          slideAnim.setValue(0);
          nextSlideAnim.setValue(1);
          setIsSliding(false);
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, testimonials, testimonialsInView]);

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? "#FBBF24" : "#D1D5DB"}
        fill={i < rating ? "#FBBF24" : "none"}
      />
    ));

  const current = testimonials[currentIndex];
  const next = testimonials[(currentIndex + 1) % testimonials.length];

  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FtestimonialbgImage.jpg?alt=media&token=bc374504-4a64-4511-b9b2-3f432d76bbcb",
      }}
      style={styles.testimonialsContainer}
      resizeMode="cover"
    >
      <Text style={styles.testimonialsTitle}>HEAR FROM OUR USERS</Text>
      <Text style={[styles.testimonialsSubtitle, { fontFamily: Fonts.body }]}>
        Hear from those who already use Mountescrow to power safe and secure
        payments.
      </Text>
      <TouchableOpacity
        style={styles.testimonialsCta}
        onPress={() => setShowModal(true)}
      >
        <PlusCircle size={18} color="#fff" />
        <Text style={[styles.testimonialsCtaText, { fontFamily: Fonts.body }]}>
          Add Your Testimonial
        </Text>
      </TouchableOpacity>
      {testimonials.length === 0 ? (
        <View style={styles.testimonialsEmpty}>
          <Text style={styles.testimonialsEmptyTitle}>No reviews yet.</Text>
          <Text style={styles.testimonialsEmptyText}>
            Be the first to share your experience with Mountescrow!
          </Text>
        </View>
      ) : (
        <View style={styles.testimonialsCarousel}>
          <Animated.View
            style={[
              styles.testimonialsCard,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-1, 0],
                      outputRange: [-400, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {current && (
              <>
                <Image
                  source={{
                    uri: current.photoUrl || "https://via.placeholder.com/96",
                  }}
                  style={styles.testimonialsAvatar}
                />
                <Text style={styles.testimonialsReview}>
                  {"{"}
                  {current.review}
                  {"}"}
                </Text>
                <View style={styles.testimonialsStars}>
                  {renderStars(current.rating)}
                </View>
                <Text style={styles.testimonialsName}>
                  {current.authorName}
                </Text>
                <Text style={styles.testimonialsRole}>
                  {current.authorTitle}
                </Text>
              </>
            )}
          </Animated.View>
          {next && (
            <Animated.View
              style={[
                styles.testimonialsNextCard,
                {
                  transform: [
                    {
                      translateX: nextSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={{
                  uri: next.photoUrl || "https://via.placeholder.com/80",
                }}
                style={styles.testimonialsNextAvatar}
              />
              <Text style={styles.testimonialsNextReview} numberOfLines={3}>
                {"{"}
                {next.review}
                {"}"}
              </Text>
            </Animated.View>
          )}
        </View>
      )}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.testimonialsModalOverlay}>
          <View style={styles.testimonialsModal}>
            <TouchableOpacity
              style={styles.testimonialsClose}
              onPress={() => setShowModal(false)}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.testimonialsModalTitle}>Add Testimonial</Text>
            <TextInput
              style={styles.testimonialsInput}
              placeholder="Your Name"
              value={formData.authorName}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, authorName: v }))
              }
            />
            <TextInput
              style={styles.testimonialsInput}
              placeholder="Your Title (e.g. Buyer, Freelancer)"
              value={formData.authorTitle}
              onChangeText={(v) =>
                setFormData((p) => ({ ...p, authorTitle: v }))
              }
            />
            <TextInput
              style={[styles.testimonialsInput, styles.testimonialsTextarea]}
              placeholder="Your Review"
              value={formData.review}
              onChangeText={(v) => setFormData((p) => ({ ...p, review: v }))}
              multiline
            />
            <TextInput
              style={styles.testimonialsInput}
              placeholder="Rating (1-5)"
              keyboardType="numeric"
              value={formData.rating.toString()}
              onChangeText={(v) =>
                setFormData((p) => ({
                  ...p,
                  rating: Math.min(5, Math.max(1, parseInt(v) || 1)),
                }))
              }
            />
            <TouchableOpacity style={styles.testimonialsFileButton}>
              <Text style={styles.testimonialsFileText}>
                {formData.photo ? "Image Selected" : "Choose Photo"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.testimonialsSubmit,
                isSubmitting && styles.testimonialsDisabled,
              ]}
            >
              <Text style={styles.testimonialsSubmitText}>
                {isSubmitting ? "Submitting..." : "Submit Testimonial"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  testimonialsContainer: {
    paddingVertical: 80,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  testimonialsTitle: {
    color: "#010e5a",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 24,
  },
  testimonialsSubtitle: {
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 768,
    marginBottom: 40,
    fontSize: 16,
  },
  testimonialsCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FB923C",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 40,
  },
  testimonialsCtaText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  testimonialsEmpty: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
    maxWidth: 400,
  },
  testimonialsEmptyTitle: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  testimonialsEmptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  testimonialsCarousel: {
    height: 400,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  testimonialsCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "80%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  testimonialsAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#1E40AF",
    marginBottom: 24,
  },
  testimonialsReview: {
    fontStyle: "italic",
    fontSize: 18,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  testimonialsStars: { flexDirection: "row", marginBottom: 8 },
  testimonialsName: { color: "#1E40AF", fontWeight: "600", fontSize: 18 },
  testimonialsRole: { color: "#6B7280", fontSize: 14 },
  testimonialsNextCard: {
    position: "absolute",
    right: 0,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "60%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    opacity: 0.8,
  },
  testimonialsNextAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#1E40AF",
    marginBottom: 16,
  },
  testimonialsNextReview: {
    fontSize: 14,
    color: "#4B5563",
    fontStyle: "italic",
  },
  testimonialsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  testimonialsModal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 450,
  },
  testimonialsClose: { position: "absolute", top: 12, right: 12 },
  testimonialsModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 16,
    textAlign: "center",
  },
  testimonialsInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  testimonialsTextarea: { height: 96, textAlignVertical: "top" },
  testimonialsFileButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  testimonialsFileText: { color: "#4B5563" },
  testimonialsSubmit: {
    backgroundColor: "#1E40AF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  testimonialsDisabled: { opacity: 0.6 },
  testimonialsSubmitText: { color: "#fff", fontWeight: "600" },
});
