import MiniPlayer from "@/components/Player/MiniPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false, // 親のStack(RootLayout)のヘッダーを使うためここはfalse
          tabBarStyle: {
            backgroundColor: "#09090b",
            borderTopColor: "#27272a",
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 8,
            paddingTop: 8,
            elevation: 0,
          },
          tabBarActiveTintColor: "#fbbf24",
          tabBarInactiveTintColor: "#71717a",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "bold",
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* 検索画面 (アイコンなし、メニュー非表示) */}
        <Tabs.Screen
          name="search"
          options={{
            href: null, // 👈 これでタブバーからボタンを隠します
          }}
        />

        <Tabs.Screen
          name="messages"
          options={{
            href: null, // 👈 これでタブバーからボタンを隠します
          }}
        />

        <Tabs.Screen
          name="rankings"
          options={{
            title: "Rankings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "trophy" : "trophy-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="upload"
          options={{
            title: "Upload",
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1">
                <Ionicons
                  name={focused ? "add-circle" : "add-circle-outline"}
                  size={32}
                  color={color}
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "musical-notes" : "musical-notes-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
}
