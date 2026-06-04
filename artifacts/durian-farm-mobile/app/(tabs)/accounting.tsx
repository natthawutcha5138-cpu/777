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
  useListTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";

const CATEGORIES_INCOME = ["ขายผลผลิต", "เงินอุดหนุน", "อื่นๆ"];
const CATEGORIES_EXPENSE = ["ปุ๋ย/สารเคมี", "แรงงาน", "น้ำมัน", "เครื่องมือ", "อื่นๆ"];
const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function formatBaht(n: number) {
  return "฿" + n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

type TxFilter = "all" | "income" | "expense";

export default function AccountingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [filter, setFilter] = useState<TxFilter>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "income", category: "ขายผลผลิต", amount: "", notes: "" });

  const { data: txs = [], isLoading } = useListTransactions({}, {
    query: { queryKey: getListTransactionsQueryKey({}) },
  });

  const createTx = useCreateTransaction({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransactionsQueryKey({}) }); setModalVisible(false); resetForm(); } } });
  const deleteTx = useDeleteTransaction({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTransactionsQueryKey({}) }) } });

  function resetForm() {
    setForm({ date: new Date().toISOString().split("T")[0], type: "income", category: "ขายผลผลิต", amount: "", notes: "" });
  }

  function handleSave() {
    if (!form.amount || isNaN(Number(form.amount))) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createTx.mutate({ date: form.date, type: form.type as "income" | "expense", category: form.category, amount: Number(form.amount), notes: form.notes || undefined });
  }

  function handleDelete(id: number) {
    Alert.alert("ลบรายการ", "ต้องการลบรายการนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); deleteTx.mutate({ id }); } },
    ]);
  }

  const filtered = filter === "all" ? txs : txs.filter((t) => t.type === filter);
  const totalIncome = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categories = form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.background,
    },
    headerTitle: { fontSize: 26, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    summaryRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 4 },
    summaryCard: { flex: 1, borderRadius: 14, padding: 14 },
    summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 4 },
    summaryValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
    filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.background },
    filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center", borderWidth: 1 },
    filterBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    listContent: { paddingHorizontal: 20, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80 },
    txItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginRight: 12 },
    txInfo: { flex: 1 },
    txCategory: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    txDate: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    txNotes: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    txRight: { alignItems: "flex-end", gap: 4 },
    txAmount: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
    txDeleteBtn: { padding: 4 },
    emptyState: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { color: colors.mutedForeground, fontSize: 15, fontFamily: "Inter_400Regular" },
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
      maxHeight: "85%",
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
    typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1 },
    typeBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    saveBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
    saveBtnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>บัญชีสวน</Text>
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: "#dcf4e3" }]}>
            <Text style={[s.summaryLabel, { color: "#2e6637" }]}>รายรับ</Text>
            <Text style={[s.summaryValue, { color: "#2e6637" }]}>{formatBaht(totalIncome)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: "#fde8e8" }]}>
            <Text style={[s.summaryLabel, { color: "#c0373c" }]}>รายจ่าย</Text>
            <Text style={[s.summaryValue, { color: "#c0373c" }]}>{formatBaht(totalExpense)}</Text>
          </View>
        </View>
      </View>

      <View style={s.filterRow}>
        {(["all", "income", "expense"] as TxFilter[]).map((f) => (
          <Pressable
            key={f}
            style={[s.filterBtn, {
              backgroundColor: filter === f ? colors.primary : "transparent",
              borderColor: filter === f ? colors.primary : colors.border,
            }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterBtnText, { color: filter === f ? colors.primaryForeground : colors.mutedForeground }]}>
              {f === "all" ? "ทั้งหมด" : f === "income" ? "รายรับ" : "รายจ่าย"}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={[...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} />
              <Text style={s.emptyText}>ยังไม่มีรายการ</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.txItem}>
              <View style={[s.txIcon, { backgroundColor: item.type === "income" ? "#dcf4e3" : "#fde8e8" }]}>
                <Ionicons
                  name={item.type === "income" ? "arrow-up" : "arrow-down"}
                  size={20}
                  color={item.type === "income" ? "#2e6637" : "#c0373c"}
                />
              </View>
              <View style={s.txInfo}>
                <Text style={s.txCategory}>{item.category}</Text>
                <Text style={s.txDate}>{formatDate(item.date)}</Text>
                {item.notes && <Text style={s.txNotes}>{item.notes}</Text>}
              </View>
              <View style={s.txRight}>
                <Text style={[s.txAmount, { color: item.type === "income" ? "#2e6637" : "#c0373c" }]}>
                  {item.type === "income" ? "+" : "-"}{formatBaht(item.amount)}
                </Text>
                <Pressable style={s.txDeleteBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Pressable style={({ pressed }) => [s.fab, { opacity: pressed ? 0.85 : 1 }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setModalVisible(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={s.modalContent} onPress={() => {}}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>เพิ่มรายการ</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>ประเภท</Text>
              <View style={s.typeRow}>
                {(["income", "expense"] as const).map((t) => (
                  <Pressable
                    key={t}
                    style={[s.typeBtn, {
                      backgroundColor: form.type === t ? (t === "income" ? "#dcf4e3" : "#fde8e8") : "transparent",
                      borderColor: form.type === t ? (t === "income" ? "#2e6637" : "#c0373c") : colors.border,
                    }]}
                    onPress={() => setForm(f => ({ ...f, type: t, category: t === "income" ? CATEGORIES_INCOME[0] : CATEGORIES_EXPENSE[0] }))}
                  >
                    <Text style={[s.typeBtnText, { color: form.type === t ? (t === "income" ? "#2e6637" : "#c0373c") : colors.mutedForeground }]}>
                      {t === "income" ? "รายรับ" : "รายจ่าย"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.formLabel}>หมวดหมู่</Text>
              <View style={s.categoryRow}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[s.catChip, {
                      backgroundColor: form.category === cat ? colors.primary : "transparent",
                      borderColor: form.category === cat ? colors.primary : colors.border,
                    }]}
                    onPress={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[s.catChipText, { color: form.category === cat ? colors.primaryForeground : colors.foreground }]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.formLabel}>จำนวนเงิน (บาท)</Text>
              <TextInput
                style={s.formInput}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                value={form.amount}
                onChangeText={(v) => setForm(f => ({ ...f, amount: v }))}
                keyboardType="numeric"
              />

              <Text style={s.formLabel}>วันที่</Text>
              <TextInput
                style={s.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
                value={form.date}
                onChangeText={(v) => setForm(f => ({ ...f, date: v }))}
              />

              <Text style={s.formLabel}>หมายเหตุ (ไม่บังคับ)</Text>
              <TextInput
                style={[s.formInput, { minHeight: 72, textAlignVertical: "top" }]}
                placeholder="หมายเหตุเพิ่มเติม"
                placeholderTextColor={colors.mutedForeground}
                value={form.notes}
                onChangeText={(v) => setForm(f => ({ ...f, notes: v }))}
                multiline
              />

              <Pressable
                style={({ pressed }) => [s.saveBtn, { opacity: pressed || createTx.isPending ? 0.85 : 1 }]}
                onPress={handleSave}
                disabled={createTx.isPending}
              >
                {createTx.isPending
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
