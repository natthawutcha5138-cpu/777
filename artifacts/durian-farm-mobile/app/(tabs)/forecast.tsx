// @ts-nocheck
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetForecast } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

function formatBaht(n: number) {
  return "฿" + n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export default function ForecastScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: forecast, isLoading, error, refetch } = useGetForecast();

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
    },
    heading: { fontSize: 26, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 4 },
    subheading: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 24 },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 16, padding: 14 },
    statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 6 },
    statValue: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
    statSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
    infoRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    infoCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 4 },
    infoLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" },
    infoValue: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 },
    recoCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "flex-start", gap: 12 },
    recoBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginTop: 1, shrink: 0 },
    recoText: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular", lineHeight: 20 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 120 },
    errorText: { color: colors.destructive, fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", marginBottom: 16 },
    retryBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { color: colors.primaryForeground, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    stageBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      alignSelf: "flex-start",
      marginBottom: 20,
    },
    stageBadgeText: { color: colors.accentForeground, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  });

  if (isLoading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>กำลังวิเคราะห์ข้อมูล AI...</Text>
      </View>
    );
  }

  if (error || !forecast) {
    return (
      <View style={[s.container, s.center]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedForeground} />
        <Text style={[s.errorText, { marginTop: 12 }]}>ไม่สามารถโหลดข้อมูลพยากรณ์ได้</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 20 }}>
          กรุณาตรวจสอบการเชื่อมต่อและลองใหม่
        </Text>
        <Pressable style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>ลองใหม่</Text>
        </Pressable>
      </View>
    );
  }

  const isPositiveYoY = forecast.yoyChange >= 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>พยากรณ์ฤดูกาล</Text>
      <Text style={s.subheading}>การวิเคราะห์และพยากรณ์โดย AI</Text>

      {forecast.currentSeasonStage && (
        <View style={s.stageBadge}>
          <Ionicons name="leaf-outline" size={14} color={colors.accentForeground} />
          <Text style={s.stageBadgeText}>ระยะปัจจุบัน: {forecast.currentSeasonStage}</Text>
        </View>
      )}

      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: "#dcf4e3" }]}>
          <Text style={[s.statLabel, { color: "#2e6637" }]}>รายรับพยากรณ์</Text>
          <Text style={[s.statValue, { color: "#2e6637" }]}>{formatBaht(forecast.forecastedIncome)}</Text>
          <Text style={[s.statSub, { color: "#4a9e5a" }]}>ฤดูกาลนี้</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: "#fde8e8" }]}>
          <Text style={[s.statLabel, { color: "#c0373c" }]}>รายจ่ายพยากรณ์</Text>
          <Text style={[s.statValue, { color: "#c0373c" }]}>{formatBaht(forecast.forecastedExpense)}</Text>
          <Text style={[s.statSub, { color: "#c0373c" }]}>ฤดูกาลนี้</Text>
        </View>
      </View>

      <View style={[s.statCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }]}>
        <Text style={[s.statLabel, { color: colors.mutedForeground }]}>กำไรสุทธิพยากรณ์</Text>
        <Text style={[s.statValue, { color: forecast.forecastedNetProfit >= 0 ? "#2e6637" : "#c0373c" }]}>
          {formatBaht(forecast.forecastedNetProfit)}
        </Text>
      </View>

      <View style={s.infoRow}>
        <View style={s.infoCard}>
          <Ionicons name={isPositiveYoY ? "trending-up-outline" : "trending-down-outline"} size={20} color={isPositiveYoY ? "#2e6637" : "#c0373c"} />
          <Text style={s.infoLabel}>เทียบปีก่อน</Text>
          <Text style={[s.infoValue, { color: isPositiveYoY ? "#2e6637" : "#c0373c" }]}>
            {isPositiveYoY ? "+" : ""}{forecast.yoyChange.toFixed(1)}%
          </Text>
        </View>
        <View style={s.infoCard}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.secondary} />
          <Text style={s.infoLabel}>เงินเฟ้อต้นทุน</Text>
          <Text style={[s.infoValue, { color: colors.secondary }]}>
            +{forecast.inputCostInflation.toFixed(1)}%
          </Text>
        </View>
      </View>

      {forecast.recommendations?.length > 0 && (
        <>
          <Text style={s.sectionTitle}>คำแนะนำ AI</Text>
          {forecast.recommendations.map((rec, i) => (
            <View key={i} style={s.recoCard}>
              <View style={s.recoBullet}>
                <Ionicons name="bulb-outline" size={14} color={colors.accentForeground} />
              </View>
              <Text style={s.recoText}>{rec}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
