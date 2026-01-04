import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import { createProposal } from "../../../../../src/services/proposal.service";
import apiClient from "../../../../../src/api/apiClient";
import { AppText } from "../../../../../components/ui/AppText";

// Validation Schema Replicated from Web
const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.date({ required_error: "Due date is required" }),
});

const formSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  creatorRole: z.enum(["buyer", "seller"]),
  counterpartyEmail: z.string().email("Invalid email"),
  escrowFeePayer: z.coerce.number().int().min(0).max(100),
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone required"),
});

function getEscrowFeePercentage(amount) {
  if (amount <= 1000000) return 0.1;
  if (amount <= 5000000) return 0.05;
  if (amount <= 50000000) return 0.04;
  if (amount <= 200000000) return 0.03;
  if (amount <= 1000000000) return 0.02;
  return 0.01;
}

const formatNumber = (num) => {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function CreateProposalScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(null);

  // FRAUD CONTROL STATES
  const [isSpecialClient, setIsSpecialClient] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const PROJECT_VALUE_LIMIT = 100000000;

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: "",
      description: "",
      creatorRole: "buyer",
      counterpartyEmail: "",
      escrowFeePayer: 50,
      milestones: [
        { title: "", amount: 0, description: "", dueDate: new Date() },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  // Check Special Client Status on Mount
  useEffect(() => {
    const checkClientStatus = async () => {
      try {
        const res = await apiClient.get("special-client");
        setIsSpecialClient(res.data.isSpecialClient || false);
      } catch (err) {
        console.error("Failed to fetch client status");
      } finally {
        setCheckingStatus(false);
      }
    };
    checkClientStatus();
  }, []);

  const watchedMilestones = useWatch({ control, name: "milestones" });
  const watchedRole = useWatch({ control, name: "creatorRole" });
  const watchedFeePayer = useWatch({ control, name: "escrowFeePayer" });

  const totals = useMemo(() => {
    const total = (watchedMilestones || []).reduce(
      (sum, m) => sum + (parseFloat(m?.amount) || 0),
      0
    );
    const baseFee = total * getEscrowFeePercentage(total);
    const vat = baseFee * 0.075;
    const totalFee = baseFee + vat;

    return {
      totalAmount: total,
      escrowFee: baseFee,
      totalFeeWithVAT: totalFee,
      buyerPortion: totalFee * (Number(watchedFeePayer) / 100),
      sellerPortion: totalFee * (1 - Number(watchedFeePayer) / 100),
    };
  }, [watchedMilestones, watchedFeePayer]);

  // Fraud Limit Check Logic
  const limitExceeded = useMemo(() => {
    return totals.totalAmount > PROJECT_VALUE_LIMIT && !isSpecialClient;
  }, [totals.totalAmount, isSpecialClient]);

  const handlePickFile = async () => {
    if (projectFiles.length >= 3)
      return Alert.alert("Limit Reached", "Max 3 files.");
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
    });
    if (!result.canceled) {
      setProjectFiles((prev) => [...prev, ...result.assets].slice(0, 3));
    }
  };

  const onInvalid = (errors) => {
    console.log("Validation Errors:", errors);
    Alert.alert(
      "Validation Error",
      "Please check all fields. Amount must be greater than 0 and descriptions are required."
    );
  };

  const onSubmit = async (values) => {
    if (limitExceeded) return;
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        return router.replace("/login");
      }

      const milestones = values.milestones.map((m) => ({
        title: m.title,
        amount: Number(m.amount),
        description: m.description,
        dueDate: m.dueDate.toISOString(),
      }));

      const response = await createProposal(
        {
          projectTitle: values.projectTitle,
          description: values.description,
          counterpartyEmail: values.counterpartyEmail,
          creatorRole: values.creatorRole,
          milestones,
          totalAmount: totals.totalAmount,
          escrowFee: totals.totalFeeWithVAT,
          escrowFeePayer: Number(values.escrowFeePayer),
          files: projectFiles,
        },
        token
      );

      Alert.alert("Success", "Proposal Created!");
      router.replace("/dashboard/proposals");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create proposal."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <View style={styles.card}>
        <AppText style={styles.label}>Project Title</AppText>
        <Controller
          control={control}
          name="projectTitle"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Website Redesign"
            />
          )}
        />

        <AppText style={styles.label}>Project Description</AppText>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="Scope of work..."
            />
          )}
        />

        <AppText style={styles.label}>
          I am creating this proposal as a:
        </AppText>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioBtn,
              watchedRole === "buyer" && styles.radioActive,
            ]}
            onPress={() => setValue("creatorRole", "buyer")}
          >
            <Ionicons
              name={
                watchedRole === "buyer" ? "radio-button-on" : "radio-button-off"
              }
              size={18}
              color={watchedRole === "buyer" ? "#f97316" : "#666"}
            />
            <AppText style={styles.radioLabel}>Buyer (Paying)</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.radioBtn,
              watchedRole === "seller" && styles.radioActive,
            ]}
            onPress={() => setValue("creatorRole", "seller")}
          >
            <Ionicons
              name={
                watchedRole === "seller"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={18}
              color={watchedRole === "seller" ? "#f97316" : "#666"}
            />
            <AppText style={styles.radioLabel}>Seller (Delivering)</AppText>
          </TouchableOpacity>
        </View>

        <AppText style={styles.label}>
          {watchedRole === "buyer" ? "Seller's Email" : "Buyer's Email"}
        </AppText>
        <Controller
          control={control}
          name="counterpartyEmail"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="email@example.com"
              keyboardType="email-address"
            />
          )}
        />

        <AppText style={styles.label}>Who pays the escrow fee?</AppText>
        <View style={styles.pickerBox}>
          <Controller
            control={control}
            name="escrowFeePayer"
            render={({ field: { onChange, value } }) => (
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="Buyer pays 100%" value={100} />
                <Picker.Item label="Buyer 75% / Seller 25%" value={75} />
                <Picker.Item label="Split 50/50" value={50} />
                <Picker.Item label="Buyer 25% / Seller 75%" value={25} />
                <Picker.Item label="Seller pays 100%" value={0} />
              </Picker>
            )}
          />
        </View>

        <AppText style={styles.label}>Project Files (Max 3)</AppText>
        <TouchableOpacity style={styles.fileBtn} onPress={handlePickFile}>
          <Ionicons name="cloud-upload-outline" size={20} color="#010e5a" />
          <AppText style={styles.fileBtnText}>
            Upload Files ({projectFiles.length}/3)
          </AppText>
        </TouchableOpacity>
        {projectFiles.map((f, i) => (
          <View key={i} style={styles.fileRow}>
            <AppText style={styles.fileName}>{f.name}</AppText>
            <TouchableOpacity
              onPress={() =>
                setProjectFiles(projectFiles.filter((_, idx) => idx !== i))
              }
            >
              <Ionicons name="close-circle" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Milestones</AppText>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            append({
              title: "",
              amount: 0,
              description: "",
              dueDate: new Date(),
            })
          }
        >
          <AppText style={styles.addBtnText}>+ Add Milestone</AppText>
        </TouchableOpacity>
      </View>

      {fields.map((field, index) => (
        <View key={field.id} style={styles.mCard}>
          <View style={styles.mHeader}>
            <AppText style={styles.mNumber}>Milestone {index + 1}</AppText>
            {fields.length > 1 && (
              <TouchableOpacity onPress={() => remove(index)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          <Controller
            control={control}
            name={`milestones.${index}.title`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.mInput}
                placeholder="Title"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name={`milestones.${index}.amount`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.mInput}
                placeholder="Amount (₦)"
                keyboardType="numeric"
                value={value === 0 ? "" : String(value)}
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name={`milestones.${index}.description`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.mInput,
                  { height: 60, textAlignVertical: "top" },
                ]}
                placeholder="What will be delivered?"
                value={value}
                onChangeText={onChange}
                multiline
              />
            )}
          />
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(index)}
          >
            <AppText style={styles.dateText}>
              Due:{" "}
              {format(watchedMilestones[index]?.dueDate || new Date(), "PPP")}
            </AppText>
            <Ionicons name="calendar-outline" size={18} color="#666" />
          </TouchableOpacity>

          {showDatePicker === index && (
            <DateTimePicker
              value={watchedMilestones[index]?.dueDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowDatePicker(null);
                if (date) setValue(`milestones.${index}.dueDate`, date);
              }}
            />
          )}
        </View>
      ))}

      <View style={styles.summaryCard}>
        <AppText style={styles.summaryTitle}>Payment Summary</AppText>
        <View style={styles.summaryRow}>
          <AppText>Subtotal</AppText>
          <AppText>₦{formatNumber(totals.totalAmount)}</AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText>
            Escrow Fee (
            {(getEscrowFeePercentage(totals.totalAmount) * 100).toFixed(1)}%)
          </AppText>
          <AppText>₦{formatNumber(totals.escrowFee)}</AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText>VAT (7.5%)</AppText>
          <AppText>
            ₦{formatNumber(totals.totalFeeWithVAT - totals.escrowFee)}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <AppText style={styles.bold}>Buyer Pays</AppText>
          <AppText style={styles.bold}>
            ₦{formatNumber(totals.buyerPortion)}
          </AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText style={styles.bold}>Seller Pays</AppText>
          <AppText style={styles.bold}>
            ₦{formatNumber(totals.sellerPortion)}
          </AppText>
        </View>
        <View style={[styles.summaryRow, { marginTop: 10 }]}>
          <AppText style={styles.totalLabel}>Project Value</AppText>
          <AppText style={styles.totalValue}>
            ₦{formatNumber(totals.totalAmount)}
          </AppText>
        </View>
      </View>

      {/* FRAUD CONTROL WARNING */}
      {limitExceeded && (
        <View style={styles.fraudAlert}>
          <Ionicons name="alert" size={24} color="#dc2626" />
          <View style={{ flex: 1 }}>
            <AppText style={styles.fraudTitle}>Limit Exceeded</AppText>
            <AppText style={styles.fraudText}>
              Projects exceeding ₦100M require verification. Please contact{" "}
              <AppText
                style={styles.link}
                onPress={() => Linking.openURL("mailto:admin@mountescrow.com")}
              >
                Admin (admin@mountescrow.com)
              </AppText>
            </AppText>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, limitExceeded && styles.disabledBtn]}
        onPress={handleSubmit(onSubmit, onInvalid)}
        disabled={loading || limitExceeded}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.submitText}>
            {limitExceeded ? "Limit Exceeded" : "Create Proposal"}
          </AppText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  label: { fontSize: 13, fontWeight: "bold", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  radioGroup: { flexDirection: "row", gap: 10, marginBottom: 20 },
  radioBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  radioActive: { borderColor: "#f97316", backgroundColor: "#fff7ed" },
  radioLabel: { fontSize: 12, fontWeight: "600" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#010e5a",
    borderRadius: 8,
    marginBottom: 10,
  },
  fileBtnText: { color: "#010e5a", fontWeight: "bold" },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    marginBottom: 5,
  },
  fileName: { fontSize: 12, color: "#666" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#010e5a" },
  addBtnText: { color: "#f97316", fontWeight: "bold" },
  mCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#010e5a",
  },
  mHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  mNumber: { fontWeight: "bold", color: "#010e5a" },
  mInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    marginBottom: 10,
  },
  dateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#010e5a",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  bold: { fontWeight: "600" },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#f97316" },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledBtn: { backgroundColor: "#d1d5db" },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  fraudAlert: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fef2f2",
    borderSize: 1,
    borderColor: "#fee2e2",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  fraudTitle: {
    color: "#991b1b",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  fraudText: { color: "#b91c1c", fontSize: 12, lineHeight: 18 },
  link: { textDecorationLine: "underline", fontWeight: "bold" },
});
