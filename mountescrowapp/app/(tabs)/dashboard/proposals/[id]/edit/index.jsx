import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getProposalById } from "../../../../../../src/services/proposal.service";
import { useAuth } from "../../../../../../contexts/AuthContexts";
import { EditProposalForm } from "./_components/EditProposalForm";

export default function EditProposalScreen() {
  const { id } = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchProposal = async () => {
        try {
          const data = await getProposalById(id);
          if (!data) {
            setError("Proposal not found");
            return;
          }
          // Permission check: only creator can edit [cite: 618]
          if (user.email !== data.creatorEmail) {
            setError("Only the creator can edit this proposal");
            return;
          }
          // Status check [cite: 619]
          if (!["Pending", "AwaitingBuyerAcceptance"].includes(data.status)) {
            setError("This proposal can no longer be edited");
            return;
          }
          setProposal(data);
        } catch (err) {
          setError("Failed to load proposal data");
        } finally {
          setLoading(false);
        }
      };
      fetchProposal();
    }
  }, [id, user]);

  if (loading || authLoading)
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#f97316" />
    );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Proposal</Text>
        <Text style={styles.subtitle}>
          Update your project details and milestones.
        </Text>
      </View>
      <EditProposalForm proposal={proposal} proposalId={id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 24, fontWeight: "bold", color: "#003366" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  errorText: { color: "#ef4444", textAlign: "center", fontWeight: "600" },
});
