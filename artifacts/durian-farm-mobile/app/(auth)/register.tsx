// @ts-nocheck
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!displayName.trim() || !username.trim() || !password.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const err = await register(username.trim(), password, displayName.trim());
    if (err) {
      setError(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }
    setLoading(false);
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    content: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: Math.max(insets.top + 24, 60),
      paddingBottom: insets.bottom + 32,
      justifyContent: "center",
    },
    backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 4 },
    backText: { color: colors.primary, fontSize: 15, fontFamily: "Inter_500Medium" },
    heading: { fontSize: 28, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 6 },
    subheading: { fontSize: 15, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 32 },
    label: { fontSize: 13, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      paddingHorizontal: 14,
    },
    input: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.foreground, fontFamily: "Inter_400Regular" },
    errorBox: { backgroundColor: `${colors.destructive}18`, borderRadius: 10, padding: 12, marginBottom: 16 },
    errorText: { color: colors.destructive, fontSize: 14, fontFamily: "Inter_400Regular" },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
      marginBottom: 24,
    },
    primaryBtnText: { color: colors.primaryForeground, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
    loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 },
    loginText: { color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_400Regular" },
    loginLink: { color: colors.primary, fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    webTopInset: Platform.OS === "web" ? { paddingTop: 67 } : {},
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[s.scroll, Platform.OS === "web" && s.webTopInset]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.content}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
              <Text style={s.backText}>กลับ</Text>
            </Pressable>

            <Text style={s.heading}>สมัครสมาชิก</Text>
            <Text style={s.subheading}>สร้างบัญชีเพื่อเริ่มใช้งาน</Text>

            <Text style={s.label}>ชื่อที่แสดง</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="ชื่อที่แสดง เช่น สมชาย"
                placeholderTextColor={colors.mutedForeground}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            <Text style={s.label}>ชื่อผู้ใช้</Text>
            <View style={s.inputRow}>
              <Ionicons name="at-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="ตัวอักษรภาษาอังกฤษ ตัวเลข"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={s.label}>รหัสผ่าน</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.primaryForeground} />
                : <Text style={s.primaryBtnText}>สมัครสมาชิก</Text>
              }
            </Pressable>

            <View style={s.loginRow}>
              <Text style={s.loginText}>มีบัญชีแล้ว?</Text>
              <Pressable onPress={() => router.back()}>
                <Text style={s.loginLink}>เข้าสู่ระบบ</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
