// @ts-nocheck
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCalculateFertilizer } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

const STAGES = [
  { id: 1, name: "เตรียมออกดอก", icon: "flower-outline" as const },
  { id: 2, name: "ออกดอก", icon: "flower" as const },
  { id: 3, name: "ติดผล", icon: "leaf-outline" as const },
  { id: 4, name: "ก่อนเก็บเกี่ยว", icon: "basket-outline" as const },
];

function formatBaht(n: number) {
  return "฿" + n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export default function FertilizerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [areRai, setAreRai] = useState("");
  const [treeCount, setTreeCount] = useState("");
  const [stage, setStage] = useState(1);

  const calc = useCalculateFertilizer();

  function handleCalculate() {
    if (!areRai && !treeCount) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    calc.mutate({
      areRai: Number(areRai) || 0,
      treeCount: Number(treeCount) || 0,
      stage,
    });
  }

  const plan = calc.data;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
    },
    heading: { fontSize: 26, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 4 },
    subheading: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
    inputRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    inputBox: { flex: 1 },
    inputLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    stageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    stageBtn: { width: "47%", borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 6 },
    stageBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
    calcBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 28,
    },
    calcBtnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
    resultSection: { marginBottom: 20 },
    resultSectionTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 },
    resultStageBadge: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      alignSelf: "flex-start",
      marginBottom: 16,
    },
    resultStageText: { color: colors.accentForeground, fontSize: 13, fontFamily: "Inter_600SemiBold" },
    itemCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    itemLeft: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    itemSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    itemRight: { alignItems: "flex-end" },
    itemQty: { fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    itemCost: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    costSummary: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 18,
      marginTop: 8,
    },
    costRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    costLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
    costValue: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
    costDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 10 },
    costTotal: { flexDirection: "row", justifyContent: "space-between" },
    costTotalLabel: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
    costTotalValue: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>คำนวณปุ๋ย</Text>
        <Text style={s.subheading}>คำนวณปุ๋ยและสารเคมีตามระยะการเจริญเติบโต</Text>

        <View style={s.inputRow}>
          <View style={s.inputBox}>
            <Text style={s.inputLabel}>พื้นที่ (ไร่)</Text>
            <TextInput
              style={s.input}
              placeholder="0.0"
              placeholderTextColor={colors.mutedForeground}
              value={areRai}
              onChangeText={setAreRai}
              keyboardType="numeric"
            />
          </View>
          <View style={s.inputBox}>
            <Text style={s.inputLabel}>จำนวนต้น</Text>
            <TextInput
              style={s.input}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              value={treeCount}
              onChangeText={setTreeCount}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>ระยะการเจริญเติบโต</Text>
        <View style={s.stageGrid}>
          {STAGES.map((st) => (
            <Pressable
              key={st.id}
              style={[s.stageBtn, {
                backgroundColor: stage === st.id ? colors.primary : colors.card,
                borderColor: stage === st.id ? colors.primary : colors.border,
              }]}
              onPress={() => setStage(st.id)}
            >
              <Ionicons name={st.icon} size={24} color={stage === st.id ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={[s.stageBtnText, { color: stage === st.id ? colors.primaryForeground : colors.foreground }]}>
                {st.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [s.calcBtn, { opacity: pressed || calc.isPending ? 0.85 : 1 }]}
          onPress={handleCalculate}
          disabled={calc.isPending || (!areRai && !treeCount)}
        >
          {calc.isPending
            ? <ActivityIndicator color={colors.primaryForeground} />
            : <Text style={s.calcBtnText}>คำนวณ</Text>
          }
        </Pressable>

        {plan && (
          <>
            <View style={s.resultSection}>
              <Text style={s.resultSectionTitle}>ผลการคำนวณ</Text>
              <View style={s.resultStageBadge}>
                <Text style={s.resultStageText}>ระยะ: {plan.stageName}</Text>
              </View>

              <Text style={[s.sectionTitle, { marginBottom: 8 }]}>ปุ๋ย</Text>
              {plan.fertilizers.map((item, i) => (
                <View key={i} style={s.itemCard}>
                  <View style={s.itemLeft}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemSub}>{item.quantityPerRai} {item.unit}/ไร่</Text>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemQty}>{item.totalQuantity.toFixed(1)} {item.unit}</Text>
                    <Text style={s.itemCost}>{formatBaht(item.totalCost)}</Text>
                  </View>
                </View>
              ))}

              {plan.pesticides.length > 0 && (
                <>
                  <Text style={[s.sectionTitle, { marginTop: 12, marginBottom: 8 }]}>สารเคมี</Text>
                  {plan.pesticides.map((item, i) => (
                    <View key={i} style={s.itemCard}>
                      <View style={s.itemLeft}>
                        <Text style={s.itemName}>{item.name}</Text>
                        <Text style={s.itemSub}>{item.quantityPerRai} {item.unit}/ไร่</Text>
                      </View>
                      <View style={s.itemRight}>
                        <Text style={s.itemQty}>{item.totalQuantity.toFixed(1)} {item.unit}</Text>
                        <Text style={s.itemCost}>{formatBaht(item.totalCost)}</Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <View style={s.costSummary}>
                <View style={s.costRow}>
                  <Text style={s.costLabel}>ค่าปุ๋ยรวม</Text>
                  <Text style={s.costValue}>{formatBaht(plan.totalFertilizerCost)}</Text>
                </View>
                {plan.pesticides.length > 0 && (
                  <View style={s.costRow}>
                    <Text style={s.costLabel}>ค่าสารเคมีรวม</Text>
                    <Text style={s.costValue}>{formatBaht(plan.totalPesticideCost)}</Text>
                  </View>
                )}
                <View style={s.costRow}>
                  <Text style={s.costLabel}>ต้นทุน/ไร่</Text>
                  <Text style={s.costValue}>{formatBaht(plan.costPerRai)}</Text>
                </View>
                <View style={s.costRow}>
                  <Text style={s.costLabel}>ต้นทุน/ต้น</Text>
                  <Text style={s.costValue}>{formatBaht(plan.costPerTree)}</Text>
                </View>
                <View style={s.costDivider} />
                <View style={s.costTotal}>
                  <Text style={s.costTotalLabel}>ต้นทุนรวมทั้งหมด</Text>
                  <Text style={s.costTotalValue}>{formatBaht(plan.totalCost)}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
