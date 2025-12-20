import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { updateProposal } from "../../../../../../../src/services/proposal.service";

// Validation Schemas
const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.date({ required_error: "Due date is required" }),
});

const formSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  escrowFeePayer: z.coerce.number().int().min(0).max(100),
  milestones: z
    .array(milestoneSchema)
    .min(1, "At least one milestone is required"),
});

function getEscrowFeePercentage(amount) {
  if (amount <= 1000000) return 0.1;
  if (amount <= 5000000) return 0.05;
  if (amount <= 50000000) return 0.04;
  if (amount <= 200000000) return 0.03;
  if (amount <= 1000000000) return 0.02;
  return 0.01;
}

export function EditProposalForm({ proposal, proposalId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(null);

  const { control, handleSubmit, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTitle: proposal.projectTitle,
      description: proposal.description,
      escrowFeePayer: proposal.escrowFeePayer || 50,
      milestones: proposal.milestones.map((m) => ({
        ...m,
        amount: m.amount,
        dueDate: m.dueDate?.seconds
          ? new Date(m.dueDate.seconds * 1000)
          : new Date(m.dueDate),
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  // Real-time watchers for auto-calculation
  const watchedMilestones = useWatch({ control, name: "milestones" });
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
      totalFeeInclVAT: totalFee,
      buyerPortion: totalFee * (Number(watchedFeePayer) / 100),
      sellerPortion: totalFee * (1 - Number(watchedFeePayer) / 100),
    };
  }, [watchedMilestones, watchedFeePayer]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const cleanMilestones = values.milestones.map((m) => ({
        ...m,
        amount: Number(m.amount),
        dueDate:
          m.dueDate instanceof Date
            ? m.dueDate.toISOString()
            : new Date(m.dueDate).toISOString(),
      }));

      // Round values to avoid floating point errors on the backend
      const payload = {
        ...values,
        milestones: cleanMilestones,
        totalAmount: parseFloat(totals.totalAmount.toFixed(2)),
        escrowFee: parseFloat(totals.totalFeeInclVAT.toFixed(2)),
        escrowFeePayer: Number(values.escrowFeePayer), // Ensure this is a clean number
        removedFiles,
      };

      await updateProposal(proposalId, payload, newFiles);

      Alert.alert("Success", "Proposal updated successfully");
      router.back();
    } catch (e) {
      console.error("Update Error Details:", e.response?.data || e.message);
      Alert.alert("Error", e.response?.data?.error || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Project Title</Text>
        <Controller
          control={control}
          name="projectTitle"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Website Redesign"
            />
          )}
        />

        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="Describe requirements"
            />
          )}
        />

        {/* Website Replicated: Escrow Fee Split Select List */}
        <Text style={styles.label}>Who pays the escrow fee?</Text>
        <View style={styles.pickerContainer}>
          <Controller
            control={control}
            name="escrowFeePayer"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                enabled={!loading}
              >
                <Picker.Item label="Buyer pays 100%" value={100} />
                <Picker.Item
                  label="Buyer pays 75%, Seller pays 25%"
                  value={75}
                />
                <Picker.Item
                  label="Buyer pays 50%, Seller pays 50%"
                  value={50}
                />
                <Picker.Item
                  label="Buyer pays 25%, Seller pays 75%"
                  value={25}
                />
                <Picker.Item label="Seller pays 100%" value={0} />
              </Picker>
            )}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Milestones</Text>
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
          <Ionicons name="add-circle" size={20} color="#f97316" />
          <Text style={styles.addText}>Add Milestone</Text>
        </TouchableOpacity>
      </View>

      {/* Website Replicated: Numbered Milestones */}
      {fields.map((item, index) => (
        <View key={item.id} style={styles.milestoneCard}>
          <View style={styles.mHeaderRow}>
            <Text style={styles.mNumberLabel}>Milestone {index + 1}</Text>
            <TouchableOpacity onPress={() => remove(index)}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name={`milestones.${index}.title`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.mInput}
                placeholder="Milestone Title (e.g. Design Phase)"
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
                style={[styles.mInput, styles.textAreaSmall]}
                placeholder="Deliverables description"
                multiline
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(index)}
          >
            <Text style={styles.dateText}>
              Due Date:{" "}
              {watchedMilestones[index]?.dueDate
                ? new Date(
                    watchedMilestones[index].dueDate
                  ).toLocaleDateString()
                : "Select Date"}
            </Text>
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

      {/* Financial Summary Breakdown */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            ₦{totals.totalAmount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Escrow Fee (
            {(getEscrowFeePercentage(totals.totalAmount) * 100).toFixed(1)}%)
          </Text>
          <Text style={styles.summaryValue}>
            ₦{totals.escrowFee.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>VAT (7.5%)</Text>
          <Text style={styles.summaryValue}>
            ₦{(totals.totalFeeInclVAT - totals.escrowFee).toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Buyer Portion ({watchedFeePayer}%)
          </Text>
          <Text style={styles.summaryValue}>
            ₦{totals.buyerPortion.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Seller Portion ({100 - watchedFeePayer}%)
          </Text>
          <Text style={styles.summaryValue}>
            ₦{totals.sellerPortion.toLocaleString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Update Proposal</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  formGroup: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  textAreaSmall: { height: 60, textAlignVertical: "top" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  addBtn: { flexDirection: "row", alignItems: "center" },
  addText: { marginLeft: 5, color: "#f97316", fontWeight: "bold" },
  milestoneCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#003366",
  },
  mHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  mNumberLabel: { fontWeight: "bold", color: "#003366", fontSize: 15 },
  mInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  dateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateText: { color: "#444" },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#003366",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: { color: "#666", fontSize: 14 },
  summaryValue: { fontWeight: "bold", color: "#333" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 60,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
