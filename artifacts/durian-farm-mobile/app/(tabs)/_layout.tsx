import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>หน้าหลัก</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="accounting">
        <Icon sf={{ default: "dollarsign.circle", selected: "dollarsign.circle.fill" }} />
        <Label>บัญชี</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plots">
        <Icon sf={{ default: "leaf", selected: "leaf.fill" }} />
        <Label>แปลง</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fertilizer">
        <Icon sf={{ default: "flask", selected: "flask.fill" }} />
        <Label>ปุ๋ย</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="forecast">
        <Icon sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis.circle.fill" }} />
        <Label>พยากรณ์</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "หน้าหลัก",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={size} />
            ) : (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="accounting"
        options={{
          title: "บัญชี",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="dollarsign.circle" tintColor={color} size={size} />
            ) : (
              <Ionicons name="receipt-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="plots"
        options={{
          title: "แปลง",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="leaf" tintColor={color} size={size} />
            ) : (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="fertilizer"
        options={{
          title: "ปุ๋ย",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="flask" tintColor={color} size={size} />
            ) : (
              <Ionicons name="flask-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: "พยากรณ์",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="chart.line.uptrend.xyaxis" tintColor={color} size={size} />
            ) : (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
