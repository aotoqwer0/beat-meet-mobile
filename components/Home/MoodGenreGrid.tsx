// components/Home/MoodGenreGrid.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 👈 追加
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { APP_MOODS } from "../../lib/constants";

// Propsの定義は削除してもOKですが、親から渡さないならインターフェース変更
// 今回は親(Home)からonTagSelectを渡さずに、ここで直接遷移させます

export default function MoodGenreGrid() {
  // Props削除
  const router = useRouter(); // 👈 追加

  const handleTagPress = (tag: string) => {
    // 検索画面へ遷移し、クエリとしてタグを渡す
    router.push({ pathname: "/search", params: { query: tag } });
  };

  return (
    <View className="mb-6">
      <View className="px-4 mb-3">
        <Text className="text-white text-xl font-black italic tracking-tighter">
          MOODS <Text className="text-zinc-600 not-italic">&</Text>{" "}
          <Text className="text-amber-400">VIBES</Text>
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {APP_MOODS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => handleTagPress(item.label)} // 👈 修正
            activeOpacity={0.7}
            className="flex-row items-center bg-zinc-900 py-2.5 px-4 rounded-xl border border-zinc-800 mr-2"
          >
            <View className="mr-2 opacity-90">
              <Ionicons name={item.icon as any} size={14} color="#fbbf24" />
            </View>
            <Text className="text-zinc-200 text-xs font-bold uppercase tracking-wider">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
