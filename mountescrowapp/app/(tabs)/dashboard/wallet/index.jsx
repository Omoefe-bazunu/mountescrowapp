import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";
import WithdrawModal from "./_components/WithdrawModal";
import FundModal from "./_components/FundModal";
import CreateVirtualAccountModal from "./_components/CreateVirtualAccountModal";
import { AppText } from "../../../../components/ui/AppText";

export default function WalletScreen() {
  const { user, loading: authLoading, refresh } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [virtualAccount, setVirtualAccount] = useState(null);

  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const router = useRouter();

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [userRes, txRes] = await Promise.all([
        apiClient.get("auth/check"),
        apiClient.get("transactions"),
      ]);
      const profile = userRes.data.user;
      setUserData(profile);
      setTransactions(txRes.data.transactions || []);

      if (profile?.accountNumber) {
        setVirtualAccount({
          virtualAccountNumber: profile.accountNumber,
          bankName: profile.bankName || "FCMB",
        });
      } else {
        setVirtualAccount(null);
      }
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadData(true), refresh()]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

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

  if (userData?.kycStatus !== "approved") {
    return (
      <View style={styles.kycContainer}>
        <Ionicons name="shield-alert-outline" size={60} color="#f97316" />
        <AppText style={styles.kycTitle}>KYC Required</AppText>
        <AppText style={styles.kycText}>
          Your KYC is {userData?.kycStatus || "pending"}. Complete verification
          to access wallet features.
        </AppText>
        <TouchableOpacity
          style={styles.kycBtn}
          onPress={() => router.push("/dashboard/kyc")}
        >
          <AppText style={styles.kycBtnText}>Complete KYC</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTransaction = (tx, idx) => {
    const isDebit =
      tx.type === "debit" || tx.amount < 0 || tx.direction === "outgoing";

    return (
      <View key={tx.id || idx} style={styles.txRow}>
        <View style={styles.txInfo}>
          <AppText style={styles.txDesc} numberOfLines={1}>
            {tx.description || tx.narration || "Transaction"}
          </AppText>
          <AppText style={styles.txDate}>
            {tx.date ? new Date(tx.date).toLocaleDateString() : "N/A"}
          </AppText>
        </View>

        <View style={styles.txAmount}>
          <AppText
            style={[styles.amountText, isDebit ? styles.red : styles.green]}
          >
            {isDebit ? "-" : "+"}₦{Math.abs(tx.amount).toLocaleString()}
          </AppText>
          <View
            style={[
              styles.statusBadge,
              tx.status === "SUCCESS" ? styles.bgSuccess : styles.bgPending,
            ]}
          >
            <AppText style={styles.statusText}>
              {tx.status?.toLowerCase()}
            </AppText>
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
          colors={["#f97316"]}
          tintColor="#f97316"
        />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.cardHeader}>
          <AppText style={styles.cardLabel}>Available Balance</AppText>
          <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
            <Ionicons
              name={balanceVisible ? "eye-off" : "eye"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        <AppText style={styles.balanceValue}>
          {balanceVisible
            ? `₦${Number(userData?.walletBalance || 0).toLocaleString()}`
            : "₦ ••••••"}
        </AppText>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowFundModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#010e5a" />
            <AppText style={styles.actionText}>Fund</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.withdrawBtn]}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Ionicons name="arrow-up-circle" size={20} color="#fff" />
            <AppText style={[styles.actionText, { color: "#fff" }]}>
              Withdraw
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Funding Info */}
      <View style={styles.infoSection}>
        <AppText style={styles.sectionTitle}>Funding Account</AppText>
        {virtualAccount ? (
          <View style={styles.accountBox}>
            <View style={styles.accountRow}>
              <AppText style={styles.accLabel}>Account Number</AppText>
              <View style={styles.accNumRow}>
                <AppText style={styles.accNum}>
                  {virtualAccount.virtualAccountNumber}
                </AppText>
                <TouchableOpacity
                  onPress={() =>
                    copyAccount(virtualAccount.virtualAccountNumber)
                  }
                >
                  <Ionicons name="copy-outline" size={18} color="#010e5a" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.accountRow}>
              <AppText style={styles.accLabel}>Bank Name</AppText>
              <AppText style={styles.accNum}>
                {virtualAccount.bankName} MFB
              </AppText>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.createAccBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <AppText style={styles.createAccText}>
              Create Virtual Account
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Transaction History - LIMITED TO 5 */}
      <View style={styles.txSection}>
        <View style={styles.txHeaderRow}>
          <AppText style={styles.sectionTitle}>Recent Transactions</AppText>
          <TouchableOpacity
            onPress={() => router.push("/dashboard/transactions")}
          >
            <AppText style={styles.viewAllText}>View All</AppText>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((tx, idx) => (
            <React.Fragment key={tx.id || idx}>
              {renderTransaction(tx, idx)}
              <View style={styles.divider} />
            </React.Fragment>
          ))
        ) : (
          <AppText style={styles.emptyText}>No transactions found.</AppText>
        )}
      </View>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        balance={userData?.walletBalance}
        userEmail={userData?.email}
        onSuccess={() => loadData(true)}
      />
      <FundModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        account={virtualAccount}
      />
      <CreateVirtualAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => loadData(true)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  balanceCard: {
    backgroundColor: "#010e5a",
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
  actionText: { fontWeight: "bold", color: "#010e5a" },
  infoSection: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  txHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    color: "#010e5a",
    fontWeight: "700",
    fontSize: 13,
  },
  accountBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  accLabel: { color: "#666", fontSize: 13 },
  accNumRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  accNum: { fontWeight: "bold", fontSize: 14, color: "#010e5a" },
  txSection: { paddingHorizontal: 16 },
  txRow: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txInfo: {
    flex: 1,
    marginRight: 15,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  txDate: { fontSize: 12, color: "#999" },
  txAmount: { alignItems: "flex-end", flexShrink: 0 },
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
    borderColor: "#010e5a",
  },
  createAccText: { color: "#010e5a", fontWeight: "bold" },
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
  emptyText: { textAlign: "center", py: 20, color: "#999" },
});
