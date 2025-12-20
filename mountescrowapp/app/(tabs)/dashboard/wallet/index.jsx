import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Clipboard,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";
import WithdrawModal from "./_components/WithdrawModal";
import FundModal from "./_components/FundModal";
import CreateVirtualAccountModal from "./_components/CreateVirtualAccountModal";

export default function WalletScreen() {
  const { user, loading: authLoading, refresh } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [virtualAccount, setVirtualAccount] = useState(null);

  // Modal states
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const router = useRouter();

  const loadData = async () => {
    try {
      const [userRes, txRes] = await Promise.all([
        apiClient.get("auth/check"),
        apiClient.get("transactions"),
      ]);

      // 1. Extract the 'user' object (This contains the accountNumber)
      const profile = userRes.data.user;

      setUserData(profile);
      setTransactions(txRes.data.transactions || []);

      // 2. Map the profile data to the virtualAccount state
      if (profile?.accountNumber) {
        setVirtualAccount({
          virtualAccountNumber: profile.accountNumber,
          bankName: profile.bankName || "FCMB",
        });
      } else {
        // This triggers the "Create Virtual Account" button if null
        setVirtualAccount(null);
      }
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Re-run your existing loadData logic
      await loadData();
      // Also refresh the Auth Context to ensure global user state is updated
      await refresh();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    loadData();
  }, []);

  const copyAccount = (num) => {
    Clipboard.setString(num);
    Alert.alert("Copied!", "Account number copied to clipboard.");
  };

  if (loading || authLoading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );

  // KYC Guard: Restricted access if not approved [cite: 820-821]
  if (userData?.kycStatus !== "approved") {
    return (
      <View style={styles.kycContainer}>
        <Ionicons name="shield-alert-outline" size={60} color="#f97316" />
        <Text style={styles.kycTitle}>KYC Required</Text>
        <Text style={styles.kycText}>
          Your KYC is {userData?.kycStatus || "pending"}. Complete verification
          to access wallet features.
        </Text>
        <TouchableOpacity
          style={styles.kycBtn}
          onPress={() => router.push("/dashboard/kyc")}
        >
          <Text style={styles.kycBtnText}>Complete KYC</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTransaction = ({ item }) => {
    // Logic to identify debits vs credits [cite: 851-852]
    const isDebit =
      item.type === "debit" || item.amount < 0 || item.direction === "outgoing";

    return (
      <View style={styles.txRow}>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc}>
            {item.description || item.narration || "Transaction"}
          </Text>
          <Text style={styles.txDate}>
            {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
          </Text>
        </View>
        <View style={styles.txAmount}>
          <Text
            style={[styles.amountText, isDebit ? styles.red : styles.green]}
          >
            {isDebit ? "-" : "+"}₦{Math.abs(item.amount).toLocaleString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "SUCCESS" ? styles.bgSuccess : styles.bgPending,
            ]}
          >
            <Text style={styles.statusText}>{item.status?.toLowerCase()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#f97316"]} // Android loader color
          tintColor="#f97316" // iOS loader color
        />
      }
    >
      {/* Balance Card [cite: 822-832] */}
      <View style={styles.balanceCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Available Balance</Text>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <Ionicons
              name={balanceVisible ? "eye-off" : "eye"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceValue}>
          {balanceVisible
            ? `₦${Number(userData?.walletBalance || 0).toLocaleString()}`
            : "₦ ••••••"}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowFundModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#003366" />
            <Text style={styles.actionText}>Fund</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.withdrawBtn]}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Ionicons name="arrow-up-circle" size={20} color="#fff" />
            <Text style={[styles.actionText, { color: "#fff" }]}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Funding Account Info [cite: 835-841] */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Funding Account</Text>
        {virtualAccount ? (
          <View style={styles.accountBox}>
            <View style={styles.accountRow}>
              <Text style={styles.accLabel}>Account Number</Text>
              <View style={styles.accNumRow}>
                <Text style={styles.accNum}>
                  {virtualAccount.virtualAccountNumber}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    copyAccount(virtualAccount.virtualAccountNumber)
                  }
                >
                  <Ionicons name="copy-outline" size={18} color="#003366" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.accountRow}>
              <Text style={styles.accLabel}>Bank Name</Text>
              <Text style={styles.accNum}>{virtualAccount.bankName} MFB</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.createAccBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createAccText}>Create Virtual Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction History [cite: 846-869] */}
      <View style={styles.txSection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.length > 0 ? (
          transactions.map((tx, idx) => (
            <React.Fragment key={tx.id || idx}>
              {renderTransaction({ item: tx })}
              <View style={styles.divider} />
            </React.Fragment>
          ))
        ) : (
          <Text style={styles.emptyText}>No transactions found.</Text>
        )}
      </View>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={userData?.walletBalance}
        onSuccess={loadData}
      />
      <FundModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        account={virtualAccount}
      />
      <CreateVirtualAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  balanceCard: {
    backgroundColor: "#003366",
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLabel: { color: "#fff", opacity: 0.8, fontSize: 14 },
  balanceValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
  },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  withdrawBtn: { backgroundColor: "#16a34a" },
  actionText: { fontWeight: "bold", color: "#003366" },
  infoSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  accountBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  accLabel: { color: "#666", fontSize: 13 },
  accNumRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  accNum: { fontWeight: "bold", fontSize: 14, color: "#003366" },
  txSection: { paddingHorizontal: 16 },
  txRow: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  txDesc: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 4 },
  txDate: { fontSize: 12, color: "#999" },
  txAmount: { alignItems: "flex-end" },
  amountText: { fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  red: { color: "#dc2626" },
  green: { color: "#16a34a" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  bgSuccess: { backgroundColor: "#dcfce7" },
  bgPending: { backgroundColor: "#fef3c7" },
  statusText: { fontSize: 10, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  createAccBtn: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#003366",
  },
  createAccText: { color: "#003366", fontWeight: "bold" },
  kycContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  kycTitle: { fontSize: 22, fontWeight: "bold", marginTop: 20, color: "#333" },
  kycText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 15,
    lineHeight: 20,
  },
  kycBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  kycBtnText: { color: "#fff", fontWeight: "bold" },
});
