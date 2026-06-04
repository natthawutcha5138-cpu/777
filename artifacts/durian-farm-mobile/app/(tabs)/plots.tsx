// @ts-nocheck
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useListPlots,
  useCreatePlot,
  useDeletePlot,
  getListPlotsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";

const VARIETIES = ["หมอนทอง", "ชะนี", "กระดุม", "พวงมณี", "ก้านยาว"];

function getStatusLabel(age: number): { label: string; color: string; bg: string } {
  if (age < 4) return { label: "กล้า", color: "#7a756f", bg: "#e6e1da" };
  if (age < 7) return { label: "ให้ผลน้อย", color: "#8f6438", bg: "#fde9c9" };
  return { label: "ให้ผลดี", color: "#2e6637", bg: "#dcf4e3" };
}

export default function PlotsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    areRai: "",
    treeCount: "",
    variety: VARIETIES[0],
    treeAge: "",
    plantedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const { data: plots = [], isLoading } = useListPlots({
    query: { queryKey: getListPlotsQueryKey() },
  });

  const createPlot = useCreatePlot({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPlotsQueryKey() });
        setModalVisible(false);
        resetForm();
      },
    },
  });

  const deletePlot = useDeletePlot({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }) },
  });

  function resetForm() {
    setForm({ name: "", areRai: "", treeCount: "", variety: VARIETIES[0], treeAge: "", plantedDate: new Date().toISOString().split("T")[0], notes: "" });
  }

  function handleSave() {
    if (!form.name.trim() || !form.areRai || !form.treeCount || !form.treeAge) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createPlot.mutate({
      name: form.name.trim(),
      areRai: Number(form.areRai),
      treeCount: Number(form.treeCount),
      variety: form.variety,
      treeAge: Number(form.treeAge),
      plantedDate: form.plantedDate,
      notes: form.notes || undefined,
    });
  }

  function handleDelete(id: number, name: string) {
    Alert.alert("ลบแปลง", `ต้องการลบแปลง "${name}" หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); deletePlot.mutate({ id }); } },
    ]);
  }

  const totalTrees = plots.reduce((s, p) => s + p.treeCount, 0);
  const totalRai = plots.reduce((s, p) => s + p.areRai, 0);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    headerTitle: { fontSize: 26, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    statsRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 4 },
    statChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    statChipText: { color: colors.accentForeground, fontSize: 13, fontFamily: "Inter_600SemiBold" },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80,
    },
    plotCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plotHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    plotName: { fontSize: 17, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", flex: 1 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
    statusText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    plotMetrics: { flexDirection: "row", gap: 12, marginBottom: 8 },
    metric: { flex: 1, alignItems: "center", backgroundColor: colors.muted, borderRadius: 10, padding: 8 },
    metricValue: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    metricLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    plotFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    plotVariety: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    deleteBtn: { padding: 4 },
    emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_400Regular" },
    emptySubtext: { color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular" },
    fab: {
      position: "absolute",
      bottom: Platform.OS === "web" ? 34 + 20 : insets.bottom + 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: Math.max(insets.bottom, 20) + 16,
      maxHeight: "90%",
    },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 20 },
    formLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
    formInput: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      marginBottom: 16,
    },
    varietyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    varietyChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    varietyChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    row2: { flexDirection: "row", gap: 12 },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
    saveBtnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>แปลงทุเรียน</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Ionicons name="map-outline" size={14} color={colors.accentForeground} />
            <Text style={s.statChipText}>{plots.length} แปลง</Text>
          </View>
          <View style={s.statChip}>
            <Ionicons name="leaf-outline" size={14} color={colors.accentForeground} />
            <Text style={s.statChipText}>{totalTrees.toLocaleString()} ต้น</Text>
          </View>
          <View style={s.statChip}>
            <Ionicons name="grid-outline" size={14} color={colors.accentForeground} />
            <Text style={s.statChipText}>{totalRai.toFixed(1)} ไร่</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={plots}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          scrollEnabled={!!plots.length}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyText}>ยังไม่มีแปลงทุเรียน</Text>
              <Text style={s.emptySubtext}>แตะปุ่ม + เพื่อเพิ่มแปลงแรก</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = getStatusLabel(item.treeAge);
            return (
              <View style={s.plotCard}>
                <View style={s.plotHeader}>
                  <Text style={s.plotName}>{item.name}</Text>
                  <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                <View style={s.plotMetrics}>
                  <View style={s.metric}>
                    <Text style={s.metricValue}>{item.treeCount}</Text>
                    <Text style={s.metricLabel}>ต้น</Text>
                  </View>
                  <View style={s.metric}>
                    <Text style={s.metricValue}>{item.areRai}</Text>
                    <Text style={s.metricLabel}>ไร่</Text>
                  </View>
                  <View style={s.metric}>
                    <Text style={s.metricValue}>{item.treeAge}</Text>
                    <Text style={s.metricLabel}>ปี</Text>
                  </View>
                </View>
                <View style={s.plotFooter}>
                  <Text style={s.plotVariety}>พันธุ์: {item.variety}</Text>
                  <Pressable style={s.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                    <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}

      <Pressable
        style={({ pressed }) => [s.fab, { opacity: pressed ? 0.85 : 1 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={s.modalContent} onPress={() => {}}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>เพิ่มแปลงใหม่</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>ชื่อแปลง</Text>
              <TextInput style={s.formInput} placeholder="เช่น แปลงเหนือ" placeholderTextColor={colors.mutedForeground} value={form.name} onChangeText={(v) => setForm(f => ({ ...f, name: v }))} />

              <Text style={s.formLabel}>พันธุ์ทุเรียน</Text>
              <View style={s.varietyRow}>
                {VARIETIES.map((v) => (
                  <Pressable key={v} style={[s.varietyChip, { backgroundColor: form.variety === v ? colors.primary : "transparent", borderColor: form.variety === v ? colors.primary : colors.border }]} onPress={() => setForm(f => ({ ...f, variety: v }))}>
                    <Text style={[s.varietyChipText, { color: form.variety === v ? colors.primaryForeground : colors.foreground }]}>{v}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>พื้นที่ (ไร่)</Text>
                  <TextInput style={s.formInput} placeholder="0.0" placeholderTextColor={colors.mutedForeground} value={form.areRai} onChangeText={(v) => setForm(f => ({ ...f, areRai: v }))} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>จำนวนต้น</Text>
                  <TextInput style={s.formInput} placeholder="0" placeholderTextColor={colors.mutedForeground} value={form.treeCount} onChangeText={(v) => setForm(f => ({ ...f, treeCount: v }))} keyboardType="numeric" />
                </View>
              </View>

              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>อายุต้น (ปี)</Text>
                  <TextInput style={s.formInput} placeholder="0" placeholderTextColor={colors.mutedForeground} value={form.treeAge} onChangeText={(v) => setForm(f => ({ ...f, treeAge: v }))} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formLabel}>วันปลูก</Text>
                  <TextInput style={s.formInput} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} value={form.plantedDate} onChangeText={(v) => setForm(f => ({ ...f, plantedDate: v }))} />
                </View>
              </View>

              <Text style={s.formLabel}>หมายเหตุ</Text>
              <TextInput style={[s.formInput, { minHeight: 60, textAlignVertical: "top" }]} placeholder="หมายเหตุเพิ่มเติม" placeholderTextColor={colors.mutedForeground} value={form.notes} onChangeText={(v) => setForm(f => ({ ...f, notes: v }))} multiline />

              <Pressable
                style={({ pressed }) => [s.saveBtn, { opacity: pressed || createPlot.isPending ? 0.85 : 1 }]}
                onPress={handleSave}
                disabled={createPlot.isPending}
              >
                {createPlot.isPending
                  ? <ActivityIndicator color={colors.primaryForeground} />
                  : <Text style={s.saveBtnText}>บันทึก</Text>
                }
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
