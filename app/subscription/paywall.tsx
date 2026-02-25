import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription } from "../../hooks/useSubscription";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentOffering, isPro, purchase, restore, loading } =
    useSubscription();

  const { monthly, tickets, superFollows } = useMemo(() => {
    if (!currentOffering)
      return { monthly: null, tickets: [], superFollows: [] };
    return {
      monthly: currentOffering.availablePackages.find(
        (p) => p.identifier === "monthly",
      ),
      tickets: currentOffering.availablePackages.filter((p) =>
        p.identifier.includes("ticket"),
      ),
      superFollows: currentOffering.availablePackages.filter((p) =>
        p.identifier.includes("sf_tier"),
      ),
    };
  }, [currentOffering]);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent justify-end">
      <Stack.Screen
        options={{ headerShown: false, presentation: "transparentModal" }}
      />

      <View className="absolute inset-0">
        <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
      </View>

      <View
        className="h-[92%] bg-neutral-900/95 rounded-t-[40px] border-t border-white/10"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* 固定ヘッダー（×ボタンのみ） */}
        <View className="z-10 absolute top-4 right-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/10 rounded-full p-1"
          >
            <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* 上部のバー */}
          <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-6" />

          {/* タイトルエリアもスクロール内に含める */}
          <View className="px-8 mb-8">
            <Text className="text-white text-4xl font-black mb-1">Premium</Text>
            <Text className="text-neutral-500 text-sm">
              BeatMeetをフル活用する特別なプラン
            </Text>
          </View>

          {/* 1. Proプラン (サブスク) */}
          <View className="px-6 mb-10">
            <Text className="text-neutral-500 text-[10px] font-bold tracking-[2px] mb-4 uppercase ml-2">
              Subscription
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => monthly && purchase(monthly)}
              className="bg-neutral-800/60 border border-white/10 rounded-[32px] p-6"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="bg-red-500 px-2 py-1 rounded-lg">
                  <Text className="text-white text-[10px] font-black italic">
                    PRO ACCESS
                  </Text>
                </View>
                <Text className="text-white text-2xl font-black">
                  {monthly?.product.priceString || "¥500"}
                  <Text className="text-xs text-neutral-400 font-normal">
                    {" "}
                    /mo
                  </Text>
                </Text>
              </View>
              <Text className="text-white text-xl font-bold mb-2">
                BeatMeet Pro
              </Text>
              <Text className="text-neutral-400 text-sm leading-6 mb-6">
                • 最高音質での視聴・配信が可能{"\n"}• 全ての広告を非表示に{"\n"}
                • プロフィールに限定Proバッジを表示
              </Text>
              <View className="bg-white py-4 rounded-2xl items-center shadow-lg">
                <Text className="text-black text-base font-bold">
                  1週間の無料トライアルを開始
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 2. Music Tickets (消耗品) */}
          <View className="px-6 mb-10">
            <Text className="text-neutral-500 text-[10px] font-bold tracking-[2px] mb-4 uppercase ml-2">
              One-time items
            </Text>
            {tickets.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                activeOpacity={0.8}
                onPress={() => purchase(pkg)}
                className="bg-white/[0.05] border border-white/5 rounded-3xl p-5 mb-4 flex-row items-center"
              >
                <View className="w-14 h-14 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20">
                  <Ionicons name="ticket" size={28} color="#EF4444" />
                </View>
                <View className="flex-1 ml-4 mr-2">
                  <Text className="text-white text-lg font-bold">
                    {pkg.product.title}
                  </Text>
                  <Text className="text-neutral-500 text-xs mt-1 leading-4">
                    楽曲の配信権を1回分アンロックします
                  </Text>
                </View>
                <View className="bg-white/10 px-4 py-2 rounded-xl">
                  <Text className="text-white font-bold">
                    {pkg.product.priceString}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Super Follows (アーティスト支援) */}
          <View className="px-6 mb-6">
            <Text className="text-neutral-500 text-[10px] font-bold tracking-[2px] mb-4 uppercase ml-2">
              Artist Support
            </Text>
            {superFollows.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                activeOpacity={0.8}
                onPress={() => purchase(pkg)}
                className="bg-white/[0.03] border border-white/[0.03] p-4 rounded-2xl mb-3 flex-row items-center"
              >
                <View className="w-10 h-10 bg-purple-500/10 rounded-full items-center justify-center">
                  <Ionicons name="heart" size={20} color="#A855F7" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white font-semibold">
                    {pkg.product.title}
                  </Text>
                  <Text className="text-neutral-500 text-[10px]">
                    {pkg.product.description}
                  </Text>
                </View>
                <Text className="text-white font-bold mr-2">
                  {pkg.product.priceString}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* フッター */}
          <TouchableOpacity onPress={restore} className="py-6 items-center">
            <Text className="text-neutral-600 text-xs underline">
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <Text className="text-neutral-700 text-[10px] text-center px-12 leading-4 pb-10">
            サブスクリプションは期間終了の24時間前までに解約しない限り自動更新されます。
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}
