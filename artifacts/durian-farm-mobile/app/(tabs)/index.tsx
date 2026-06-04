// @ts-nocheck
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetDashboardSummary,
  useListTransactions,
  getListTransactionsQueryKey,
} from "@workspace/api-client-react";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatBaht(n: number) {
  if (Math.abs(n) >= 1_000_000) return "฿" + (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return "฿" + (n / 1_000).toFixed(1) + "K";
  return "฿" + n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const year = new Date().getFullYear();

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useGetDashboardSummary({ year });
  const { data: txs = [], isLoading: txLoading, refetch: refetchTxs } = useListTransactions({}, {
    query: { queryKey: getListTransactionsQueryKey({}) },
  });

  const recentTxs = [...txs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const isRefreshing = summaryLoading || txLoading;

  function handleRefresh() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetchSummary();
    refetchTxs();
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    greeting: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    userName: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginTop: 2 },
    logoutBtn: { padding: 8, borderRadius: 12, backgroundColor: colors.muted },
    heroCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginBottom: 16 },
    heroLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
    heroValue: { color: "#fff", fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
    heroRow: { flexDirection: "row", marginTop: 14, gap: 16 },
    heroStat: { flex: 1 },
    heroStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
    heroStatValue: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 2 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    statCard: {
      flex: 1, minWidth: "45%", backgroundColor: colors.card, borderRadius: 16,
      padding: 14, borderWidth: 1, borderColor: colors.border,
    },
    statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    statLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    statSub: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    sectionLink: { color: colors.primary, fontSize: 13, fontFamily: "Inter_500Medium" },
    quickActRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    quickAct: {
      flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14,
      alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border,
    },
    quickActLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, textAlign: "center" },
    txItem: {
      flexDirection: "row", alignItems: "center", backgroundColor: colors.card,
      borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
    },
    txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 10 },
    txInfo: { flex: 1 },
    txCategory: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    txDate: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    txAmount: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
    emptyTx: { alignItems: "center", paddingVertical: 24, gap: 8 },
    emptyTxText: { color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_400Regular" },
  });

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
      <View style={s.headerRow}>
        <View>
          <Text style={s.greeting}>สวัสดี 👋</Text>
          <Text style={s.userName}>{user?.displayName}</Text>
        </View>
        <Pressable style={s.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={s.heroCard}>
        <Text style={s.heroLabel}>กำไรสุทธิปี {year + 543}</Text>
        {summaryLoading
          ? <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
          : <Text style={s.heroValue}>{formatBaht(summary?.netProfit ?? 0)}</Text>
        }
        <View style={s.heroRow}>
          <View style={s.heroStat}>
            <Text style={s.heroStatLabel}>รายรับ</Text>
            <Text style={s.heroStatValue}>{formatBaht(summary?.totalIncome ?? 0)}</Text>
          </View>
          <View style={s.heroStat}>
            <Text style={s.heroStatLabel}>รายจ่าย</Text>
            <Text style={s.heroStatValue}>{formatBaht(summary?.totalExpense ?? 0)}</Text>
          </View>
          <View style={s.heroStat}>
            <Text style={s.heroStatLabel}>ROI</Text>
            <Text style={s.heroStatValue}>{(summary?.roi ?? 0).toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <View style={[s.statIcon, { backgroundColor: "#dcf4e3" }]}>
            <Ionicons name="leaf-outline" size={18} color="#2e6637" />
          </View>
          <Text style={s.statLabel}>แปลงทั้งหมด</Text>
          <Text style={s.statValue}>{summary?.totalPlots ?? 0}</Text>
          <Text style={s.statSub}>แปลง</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIcon, { backgroundColor: "#dcf4e3" }]}>
            <Ionicons name="nutrition-outline" size={18} color="#2e6637" />
          </View>
          <Text style={s.statLabel}>ต้นไม้รวม</Text>
          <Text style={s.statValue}>{(summary?.totalTrees ?? 0).toLocaleString()}</Text>
          <Text style={s.statSub}>ต้น</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIcon, { backgroundColor: "#fde8e8" }]}>
            <Ionicons name="cash-outline" size={18} color="#c0373c" />
          </View>
          <Text style={s.statLabel}>ต้นทุน/ไร่</Text>
          <Text style={s.statValue}>{formatBaht(summary?.costPerRai ?? 0)}</Text>
          <Text style={s.statSub}>บาท/ไร่</Text>
        </View>
        <View style={s.statCard}>
          <View style={[s.statIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.accentForeground} />
          </View>
          <Text style={s.statLabel}>รายได้/ต้น</Text>
          <Text style={s.statValue}>{formatBaht(summary?.revenuePerTree ?? 0)}</Text>
          <Text style={s.statSub}>บาท/ต้น</Text>
        </View>
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>จัดการด่วน</Text>
      </View>
      <View style={s.quickActRow}>
        <Pressable style={({ pressed }) => [s.quickAct, { opacity: pressed ? 0.8 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/accounting"); }}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={s.quickActLabel}>เพิ่มรายการ</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.quickAct, { opacity: pressed ? 0.8 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/fertilizer"); }}>
          <Ionicons name="flask-outline" size={24} color={colors.secondary} />
          <Text style={s.quickActLabel}>คำนวณปุ๋ย</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.quickAct, { opacity: pressed ? 0.8 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/forecast"); }}>
          <Ionicons name="trending-up-outline" size={24} color="#8f6438" />
          <Text style={s.quickActLabel}>พยากรณ์</Text>
        </Pressable>
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>รายการล่าสุด</Text>
        <Pressable onPress={() => router.push("/(tabs)/accounting")}>
          <Text style={s.sectionLink}>ดูทั้งหมด</Text>
        </Pressable>
      </View>

      {txLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : recentTxs.length === 0 ? (
        <View style={s.emptyTx}>
          <Ionicons name="receipt-outline" size={32} color={colors.mutedForeground} />
          <Text style={s.emptyTxText}>ยังไม่มีรายการ</Text>
        </View>
      ) : (
        recentTxs.map((tx) => (
          <View key={tx.id} style={s.txItem}>
            <View style={[s.txIcon, { backgroundColor: tx.type === "income" ? "#dcf4e3" : "#fde8e8" }]}>
              <Ionicons name={tx.type === "income" ? "arrow-up" : "arrow-down"} size={16} color={tx.type === "income" ? "#2e6637" : "#c0373c"} />
            </View>
            <View style={s.txInfo}>
              <Text style={s.txCategory}>{tx.category}</Text>
              <Text style={s.txDate}>{formatDate(tx.date)}</Text>
            </View>
            <Text style={[s.txAmount, { color: tx.type === "income" ? "#2e6637" : "#c0373c" }]}>
              {tx.type === "income" ? "+" : "-"}฿{tx.amount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
