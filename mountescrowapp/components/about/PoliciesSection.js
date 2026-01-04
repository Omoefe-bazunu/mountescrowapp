// components/about/PoliciesSection.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { AppText } from "../ui/AppText";
import { FilePlus, Trash2, FileText } from "lucide-react-native";
import { Fonts } from "../../constants/Fonts";
import {
  getPolicies,
  uploadPolicyPdf,
  deletePolicyPdf,
} from "../../src/services/policies.service";
import apiClient from "../../src/api/apiClient"; // Import your API client

// Match the list from server.js
const ADMIN_EMAILS = ["raniem57@gmail.com", "mountescrow@gmail.com"];

export default function PoliciesSection() {
  const [activeTab, setActiveTab] = useState("");
  const [policyData, setPolicyData] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadPolicies();
  }, []);

  // UPDATED: Fetch user from API to verify Admin status reliably
  const checkAdminStatus = async () => {
    try {
      const response = await apiClient.get("auth/check");
      const user = response.data.user;

      console.log("Logged in as:", user.email); // Debug log

      if (user && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (e) {
      console.log("Error checking admin status:", e);
      setIsAdmin(false);
    }
  };

  const loadPolicies = async () => {
    setLoading(true);
    const data = await getPolicies();
    setPolicyData(data);

    // Set default tab if not set
    if (!activeTab && Object.keys(data).length > 0) {
      setActiveTab(Object.keys(data)[0]);
    } else if (activeTab && !data[activeTab]) {
      setActiveTab(Object.keys(data)[0] || "");
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!activeTab) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // Validate PDF type
      if (
        file.mimeType !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        return Alert.alert("Error", "Only PDF files are allowed");
      }

      setActionLoading(true);
      await uploadPolicyPdf(activeTab, file);
      Alert.alert("Success", "Policy PDF uploaded successfully");
      await loadPolicies();
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeTab) return;

    Alert.alert(
      "Delete Policy PDF",
      `Are you sure you want to delete the PDF for ${activeTab}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await deletePolicyPdf(activeTab);
              Alert.alert("Success", "PDF deleted successfully");
              await loadPolicies();
            } catch (error) {
              Alert.alert("Delete Failed", error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPDF = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  if (loading && Object.keys(policyData).length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#010e5a" />
      </View>
    );
  }

  const currentPolicy = policyData[activeTab];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.title}>Policies & Terms</AppText>
        <AppText style={[styles.subtitle, { fontFamily: Fonts.body }]}>
          Our policies and terms of use are designed to be fair, transparent,
          and efficient.
        </AppText>

        {/* Dynamic Tabs */}
        <View style={styles.tabsContainer}>
          {Object.keys(policyData).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive]}
              onPress={() => setActiveTab(key)}
            >
              <AppText
                style={[
                  styles.tabText,
                  { fontFamily: Fonts.body },
                  activeTab === key && styles.tabTextActive,
                ]}
              >
                {key}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Card */}
        {currentPolicy && (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <AppText style={styles.cardTitle}>{activeTab}</AppText>

              {/* Admin Controls */}
              {isAdmin && (
                <View style={styles.adminControls}>
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#010e5a" />
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={handleUpload}
                        style={styles.iconBtn}
                      >
                        <FilePlus size={24} color="#010e5a" />
                      </TouchableOpacity>

                      {currentPolicy.pdfUrl && (
                        <TouchableOpacity
                          onPress={handleDelete}
                          style={styles.iconBtn}
                        >
                          <Trash2 size={24} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>

            <AppText style={[styles.cardText, { fontFamily: Fonts.body }]}>
              {currentPolicy.summary}
            </AppText>

            {/* View PDF Button */}
            {currentPolicy.pdfUrl ? (
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={() => handleOpenPDF(currentPolicy.pdfUrl)}
              >
                <FileText size={20} color="#fff" style={{ marginRight: 8 }} />
                <AppText
                  style={[styles.pdfButtonText, { fontFamily: Fonts.body }]}
                >
                  View Full {activeTab} PDF
                </AppText>
              </TouchableOpacity>
            ) : (
              <AppText style={styles.noPdfText}>
                {isAdmin
                  ? "No PDF uploaded yet. Use the + icon above to upload."
                  : "PDF currently unavailable."}
              </AppText>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  content: {
    maxWidth: 896,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#010e5a",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 32,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  tabActive: {
    backgroundColor: "#010e5a",
    borderColor: "#010e5a",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  adminControls: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#F3F4F6", // Slight background to make icons pop
    padding: 6,
    borderRadius: 8,
  },
  iconBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#010e5a",
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 24,
  },
  pdfButton: {
    backgroundColor: "#FB923C",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noPdfText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontSize: 14,
  },
});
