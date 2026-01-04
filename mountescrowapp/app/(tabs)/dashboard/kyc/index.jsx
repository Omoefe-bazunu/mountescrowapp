import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AppText } from "../../../../components/ui/AppText";

const kycFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  middleName: z.string().optional(),
  phone: z.string().regex(/^(\+234|0)?[789]\d{9}$/, "Invalid phone number"),
  dob: z.date({ required_error: "Date of birth is required" }),
  bvn: z.string().length(11, "BVN must be 11 digits"),
  gender: z.enum(["M", "F"], { required_error: "Select gender" }),
});

export default function KycScreen() {
  const { refresh } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phone: "",
      bvn: "",
      gender: "M",
    },
  });

  const selectedGender = watch("gender");

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("auth/check");
      const data = response.data.user;
      if (data) {
        setUserData(data);
        if (data.displayName) {
          const parts = data.displayName.split(" ");
          setValue("firstName", parts[0] || "");
          setValue("middleName", parts.length > 2 ? parts[1] : "");
          setValue("lastName", parts[parts.length - 1] || "");
        }
        if (data.phone) setValue("phone", data.phone);
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let formattedPhone = data.phone.replace(/[\s\-\(\)]/g, "");
      if (formattedPhone.startsWith("+234"))
        formattedPhone = formattedPhone.substring(4);
      else if (formattedPhone.startsWith("0"))
        formattedPhone = formattedPhone.substring(1);

      const response = await apiClient.post("bvn-verification", {
        ...data,
        phone: formattedPhone,
        dob: data.dob.toISOString().split("T")[0],
      });

      if (response.data.success) {
        await refresh(); // Update Auth Context
        await fetchUserData(); // Refresh local screen state
        Alert.alert("Success", "KYC Verified Successfully!");
        // NO REDIRECT: Logic now stays on this screen
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      Alert.alert("Verification Failed", error.message);
      fetchUserData(); // Refresh to show any rejected status/reasons
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#f97316" />
    );

  const status = userData?.kycStatus || "pending";

  if (status === "approved") {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#16a34a" />
        <AppText style={styles.successTitle}>KYC Approved!</AppText>
        <AppText style={styles.successSub}>Your identity is verified.</AppText>
        <AppText style={styles.successSub}>
          Your wallet is ready for transactions.
        </AppText>
        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => router.push("/dashboard/wallet")}
        >
          <AppText style={styles.walletBtnText}>Go to Wallet</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <AppText style={styles.title}>KYC Verification</AppText>
      <AppText style={styles.subtitle}>
        Complete this to access wallet features.
      </AppText>

      {status === "rejected" && (
        <View style={styles.rejectBanner}>
          <AppText style={styles.rejectText}>
            Rejected: {userData.rejectionReason}
          </AppText>
        </View>
      )}

      <View style={styles.form}>
        <AppText style={styles.label}>First Name</AppText>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="John"
            />
          )}
        />
        {errors.firstName && (
          <AppText style={styles.errorText}>{errors.firstName.message}</AppText>
        )}

        <AppText style={styles.label}>Middle Name (Optional)</AppText>
        <Controller
          control={control}
          name="middleName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Quincy"
            />
          )}
        />

        <AppText style={styles.label}>Last Name</AppText>
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Doe"
            />
          )}
        />
        {errors.lastName && (
          <AppText style={styles.errorText}>{errors.lastName.message}</AppText>
        )}

        <AppText style={styles.label}>Phone Number</AppText>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="080..."
              keyboardType="phone-pad"
            />
          )}
        />
        {errors.phone && (
          <AppText style={styles.errorText}>{errors.phone.message}</AppText>
        )}

        <AppText style={styles.label}>Gender</AppText>
        <View style={styles.genderContainer}>
          {["M", "F"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderBtn,
                selectedGender === g && styles.genderBtnActive,
              ]}
              onPress={() => setValue("gender", g)}
            >
              <AppText
                style={[
                  styles.genderBtnText,
                  selectedGender === g && styles.genderBtnTextActive,
                ]}
              >
                {g === "M" ? "Male" : "Female"}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={styles.label}>Date of Birth</AppText>
        <Controller
          control={control}
          name="dob"
          render={({ field: { value } }) => (
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <AppText>{value ? value.toDateString() : "Select Date"}</AppText>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
        />
        {errors.dob && (
          <AppText style={styles.errorText}>{errors.dob.message}</AppText>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setValue("dob", date);
            }}
          />
        )}

        <AppText style={styles.label}>BVN (11 Digits)</AppText>
        <Controller
          control={control}
          name="bvn"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="222..."
              keyboardType="numeric"
              maxLength={11}
            />
          )}
        />
        {errors.bvn && (
          <AppText style={styles.errorText}>{errors.bvn.message}</AppText>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.submitText}>Submit & Verify</AppText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center" },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#010e5a" },
  subtitle: { color: "#666", marginBottom: 20 },
  rejectBanner: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  rejectText: { color: "#991b1b", fontSize: 13 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderContainer: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: "#010e5a", borderColor: "#010e5a" },
  genderBtnText: { color: "#666", fontWeight: "600" },
  genderBtnTextActive: { color: "#fff" },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#010e5a",
    marginTop: 20,
  },
  successSub: { color: "#666", textAlign: "center", marginTop: 10 },
  walletBtn: {
    backgroundColor: "#010e5a",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  walletBtnText: { color: "#fff", fontWeight: "bold" },
});
