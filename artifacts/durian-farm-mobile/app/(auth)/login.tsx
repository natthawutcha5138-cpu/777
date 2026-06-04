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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const err = await login(username.trim(), password);
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
      paddingTop: Math.max(insets.top + 40, 80),
      paddingBottom: insets.bottom + 32,
      justifyContent: "center",
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    heading: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    subheading: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 36,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 8,
    },
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
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    eyeBtn: { padding: 4 },
    errorBox: {
      backgroundColor: `${colors.destructive}18`,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: { color: colors.destructive, fontSize: 14, fontFamily: "Inter_400Regular" },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 4,
      marginBottom: 24,
    },
    primaryBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    divider: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { paddingHorizontal: 12, color: colors.mutedForeground, fontSize: 13 },
    registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 },
    registerText: { color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_400Regular" },
    registerLink: { color: colors.primary, fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    webTopInset: Platform.OS === "web" ? { paddingTop: 67 } : {},
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, Platform.OS === "web" && s.webTopInset]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.content}>
            <View style={s.logo}>
              <Ionicons name="leaf" size={36} color="#fff" />
            </View>

            <Text style={s.heading}>เข้าสู่ระบบ</Text>
            <Text style={s.subheading}>ระบบจัดการสวนทุเรียนอัจฉริยะ</Text>

            <Text style={s.label}>ชื่อผู้ใช้</Text>
            <View style={s.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="ชื่อผู้ใช้"
                placeholderTextColor={colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                testID="username-input"
              />
            </View>

            <Text style={s.label}>รหัสผ่าน</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
              <TextInput
                style={s.input}
                placeholder="รหัสผ่าน"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="password-input"
              />
              <Pressable style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [s.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
              testID="login-button"
            >
              {loading
                ? <ActivityIndicator color={colors.primaryForeground} />
                : <Text style={s.primaryBtnText}>เข้าสู่ระบบ</Text>
              }
            </Pressable>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>หรือ</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={s.registerRow}>
              <Text style={s.registerText}>ยังไม่มีบัญชี?</Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={s.registerLink}>สมัครสมาชิกฟรี</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
