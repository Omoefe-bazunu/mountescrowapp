import React, { useEffect, useState, useRef } from "react";
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
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
// ✅ REVERTED: Back to ImagePicker
import * as ImagePicker from "expo-image-picker";
import {
  Star,
  PlusCircle,
  X,
  Trash2,
  Edit2,
  Image as ImageIcon,
} from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";
import {
  getAllTestimonials,
  getMyTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../src/services/testimonials.service";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [userTestimonial, setUserTestimonial] = useState(null);

  // Track image load errors to show fallback if URL is broken
  const [imageError, setImageError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    authorTitle: "",
    review: "",
    rating: 5,
    photo: null,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allData = await getAllTestimonials();
      setTestimonials(allData);
      const myData = await getMyTestimonial();
      setUserTestimonial(myData);
    } catch (e) {
      console.log("Error loading testimonials", e);
    }
  };

  // Reset error state when sliding
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    if (testimonials.length > 1 && !showModal) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, testimonials, showModal]);

  const handleOpenModal = () => {
    if (userTestimonial) {
      setFormData({
        authorName: userTestimonial.authorName,
        authorTitle: userTestimonial.authorTitle,
        review: userTestimonial.review,
        rating: userTestimonial.rating,
        photo: null,
      });
    } else {
      setFormData({
        authorName: "",
        authorTitle: "",
        review: "",
        rating: 5,
        photo: null,
      });
    }
    setShowModal(true);
  };

  // ✅ REVERTED: Using ImagePicker (Safe Mode)
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to photos.");
      return;
    }

    // allowsEditing: false prevents the 'stuck' crop screen on some Androids
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // Ensure we have a name for the file (required for upload)
      const localUri = asset.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      setFormData({
        ...formData,
        photo: {
          uri: localUri,
          name: filename,
          type: type,
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.authorName || !formData.review) {
      return Alert.alert("Required", "Name and Review are required.");
    }

    setIsSubmitting(true);
    try {
      if (userTestimonial) {
        await updateTestimonial(userTestimonial.id, formData, formData.photo);
        Alert.alert("Success", "Testimonial updated!");
      } else {
        await createTestimonial(formData, formData.photo);
        Alert.alert("Success", "Testimonial submitted!");
      }

      await loadData();
      setShowModal(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your testimonial?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await deleteTestimonial(userTestimonial.id);
              Alert.alert("Deleted", "Your testimonial has been removed.");
              setUserTestimonial(null);
              await loadData();
              setShowModal(false);
            } catch (error) {
              Alert.alert("Error", "Failed to delete.");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating) => (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? "#FBBF24" : "#D1D5DB"}
          fill={i < rating ? "#FBBF24" : "none"}
        />
      ))}
    </View>
  );

  const current = testimonials[currentIndex];

  return (
    <ImageBackground
      source={{
        uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FtestimonialbgImage.jpg?alt=media&token=bc374504-4a64-4511-b9b2-3f432d76bbcb",
      }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>HEAR FROM OUR USERS</Text>
        <Text style={[styles.subtitle, { fontFamily: Fonts.body }]}>
          Hear from those who already use Mountescrow to power safe and secure
          payments.
        </Text>

        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenModal}>
          {userTestimonial ? (
            <Edit2 size={18} color="#fff" />
          ) : (
            <PlusCircle size={18} color="#fff" />
          )}
          <Text style={[styles.ctaText, { fontFamily: Fonts.body }]}>
            {userTestimonial
              ? "Update Your Testimonial"
              : "Add Your Testimonial"}
          </Text>
        </TouchableOpacity>

        {testimonials.length === 0 ? (
          <View style={styles.card}>
            <Text style={{ color: "#666" }}>No reviews yet.</Text>
          </View>
        ) : (
          current && (
            <View style={styles.card}>
              <View style={styles.avatarContainer}>
                {/* Display Image logic:
                   1. Try to render Image if photoUrl exists.
                   2. If it fails (onError) OR no photoUrl, show Initials.
                */}
                {current.photoUrl && !imageError ? (
                  <Image
                    source={{ uri: current.photoUrl }}
                    style={styles.avatar}
                    resizeMode="cover"
                    onError={(e) => {
                      console.log("Image Load Error:", e.nativeEvent.error);
                      setImageError(true);
                    }}
                  />
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>
                      {current.authorName?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.reviewText, { fontFamily: Fonts.body }]}>
                &quot;{current.review}&quot;
              </Text>

              <View style={{ alignItems: "center", gap: 6 }}>
                {renderStars(current.rating)}
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={[styles.authorName, { fontFamily: Fonts.heading }]}
                  >
                    {current.authorName}
                  </Text>
                  <Text style={[styles.authorRole, { fontFamily: Fonts.body }]}>
                    {current.authorTitle}
                  </Text>
                </View>
              </View>
            </View>
          )
        )}
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {userTestimonial ? "Update Review" : "Share Experience"}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={formData.authorName}
                onChangeText={(t) =>
                  setFormData({ ...formData, authorName: t })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Your Title (e.g. Freelancer)"
                value={formData.authorTitle}
                onChangeText={(t) =>
                  setFormData({ ...formData, authorTitle: t })
                }
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your review..."
                multiline
                value={formData.review}
                onChangeText={(t) => setFormData({ ...formData, review: t })}
              />

              <Text style={styles.label}>Rating (1-5)</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setFormData({ ...formData, rating: num })}
                  >
                    <Star
                      size={28}
                      color={num <= formData.rating ? "#FBBF24" : "#E5E7EB"}
                      fill={num <= formData.rating ? "#FBBF24" : "none"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Image Preview */}
              <View style={styles.imagePreviewContainer}>
                {formData.photo ? (
                  <Image
                    source={{ uri: formData.photo.uri }}
                    style={styles.previewImage}
                  />
                ) : userTestimonial?.photoUrl ? (
                  <Image
                    source={{ uri: userTestimonial.photoUrl }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.placeholderPreview}>
                    <ImageIcon size={32} color="#9CA3AF" />
                    <Text style={styles.placeholderText}>
                      No photo selected
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickImage}
              >
                <Text style={styles.uploadBtnText}>
                  {formData.photo
                    ? "Change Photo"
                    : userTestimonial?.photoUrl
                    ? "Update Photo (Optional)"
                    : "Upload Photo (Optional)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>
                    {userTestimonial ? "Save Changes" : "Submit Review"}
                  </Text>
                )}
              </TouchableOpacity>

              {userTestimonial && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={styles.deleteText}>Delete Review</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    width: "100%",
  },
  overlay: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#010e5a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 32,
    gap: 8,
    elevation: 3,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#010e5a",
    backgroundColor: "#E5E7EB",
  },
  initialsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#010e5a",
  },
  initialsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6B7280",
  },
  reviewText: {
    fontSize: 15,
    color: "#374151",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#010e5a",
    marginTop: 4,
  },
  authorRole: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#010e5a",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  imagePreviewContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderPreview: {
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  uploadBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#003366",
    borderStyle: "dashed",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#F0F9FF",
  },
  uploadBtnText: {
    color: "#003366",
    fontWeight: "600",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#010e5a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "600",
  },
});
