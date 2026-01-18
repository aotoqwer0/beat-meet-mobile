import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-black z-50 border-b border-zinc-900/50"
      style={{
        // 上部のセーフエリア分だけパディングを確保
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center justify-between px-4 py-3 h-14">
        {/* --- 左側: ブランドロゴ --- */}
        <View className="flex-row items-center">
          <Image
            source={require("../assets/images/logo.jpg")}
            className="h-8 w-8 mr-2 rounded-full border border-zinc-800"
            resizeMode="cover"
          />
          <Text className="text-white text-xl font-black italic tracking-tighter shadow-black shadow-lg">
            Beat<Text className="text-amber-400">Meet</Text>
          </Text>
        </View>

        {/* --- 右側: アクションボタン群 (検索 & メッセージ) --- */}
        <View className="flex-row items-center gap-2">
          {/* 検索ボタン */}
          <TouchableOpacity
            // 修正: 遷移先をタブ内の検索画面へ変更
            onPress={() => router.push("/(tabs)/search")}
            className="w-10 h-10 rounded-full items-center justify-center active:bg-zinc-900"
          >
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>

          {/* メッセージボタン */}
          <TouchableOpacity
            onPress={() => router.push("/messages")}
            className="w-10 h-10 rounded-full items-center justify-center active:bg-zinc-900 relative"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="white"
            />

            {/* 未読バッジ（モック用）: 必要なら条件付きで表示 */}
            {/* <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-black" /> */}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
