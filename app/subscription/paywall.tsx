import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription } from "../../hooks/useSubscription";

// 特典リスト
const BENEFITS = [
  {
    icon: "musical-notes",
    title: "Unlimited Uploads",
    desc: "No limits on your artistic expression.",
  },
  {
    icon: "heart",
    title: "1 Super Follow Included",
    desc: "Support your favorite artist directly.",
  },
  {
    icon: "ban",
    title: "Ad-Free Experience",
    desc: "Enjoy music without interruptions.",
  },
  {
    icon: "shield-checkmark", // アイコン名を修正（star -> shield-checkmark等、より適切なものへ）
    title: "Verified Badge",
    desc: "Stand out with a gold verification badge.",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { packages, purchasePackage, restorePurchases, loading, isPro } =
    useSubscription();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      const yearly = packages.find((p) => p.packageType === "ANNUAL");
      setSelectedPackage(yearly || packages[0]);
    }
  }, [packages]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    const success = await purchasePackage(selectedPackage);
    if (success) {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
      <StatusBar style="light" />

      {/* --- 背景画像 & グラデーション --- */}
      <View className="absolute inset-0 h-3/4">
        <Image
          source={{
            uri: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          }}
          className="w-full h-full opacity-50"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "#000000"]}
          className="absolute inset-0"
          start={{ x: 0, y: 0.2 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        {/* --- ヘッダー --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10 backdrop-blur-md"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={restorePurchases}>
            <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
              Restore
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {/* --- タイトルエリア --- */}
          <View className="items-center mb-12 mt-6">
            <View className="bg-amber-400 px-3 py-1 rounded-full mb-5">
              <Text className="text-black font-black tracking-[3px] text-[10px] uppercase">
                Beat Meet Pro
              </Text>
            </View>
            <Text className="text-white text-5xl font-black italic tracking-tighter text-center leading-tight shadow-xl">
              UNLOCK <Text className="text-amber-400">YOUR</Text>
              {"\n"}POTENTIAL
            </Text>
            <Text className="text-zinc-300 text-center mt-4 font-medium leading-6 text-sm opacity-80">
              Join the exclusive community of creators and{"\n"}super fans.
            </Text>
          </View>

          {/* --- 特典リスト (修正: アイコン縮小 & 間隔拡大) --- */}
          <View className="mb-14 space-y-9">
            {BENEFITS.map((item, index) => (
              <View key={index} className="flex-row items-start">
                {/* アイコンサイズを w-12 -> w-10 に縮小 */}
                <View className="w-10 h-10 rounded-xl bg-zinc-900/80 border border-zinc-800 items-center justify-center mr-5 mt-1">
                  {/* アイコン自体も少し小さく size={20} */}
                  <Ionicons name={item.icon as any} size={20} color="#fbbf24" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-white font-bold text-base mb-1 tracking-tight">
                    {item.title}
                  </Text>
                  <Text className="text-zinc-500 text-xs leading-5">
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* --- プラン選択 (修正: 微調整) --- */}
          <View className="space-y-4 mb-36">
            {packages.map((pack) => {
              const isSelected =
                selectedPackage?.identifier === pack.identifier;
              const isAnnual = pack.packageType === "ANNUAL";

              return (
                <TouchableOpacity
                  key={pack.identifier}
                  onPress={() => setSelectedPackage(pack)}
                  activeOpacity={0.9}
                  className={`flex-row items-center p-5 rounded-3xl border relative transition-all ${
                    isSelected
                      ? "bg-zinc-900 border-amber-400 border-2"
                      : "bg-zinc-900/40 border-zinc-800 border"
                  }`}
                >
                  {isAnnual && (
                    <View className="absolute -top-3 right-6 bg-amber-400 px-3 py-1 rounded-full shadow-lg shadow-amber-900/40 z-10">
                      <Text className="text-black text-[10px] font-black uppercase tracking-wider">
                        Best Offer
                      </Text>
                    </View>
                  )}

                  {/* ラジオボタンも少し小さく w-6 -> w-5 */}
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-5 ${
                      isSelected ? "border-amber-400" : "border-zinc-600"
                    }`}
                  >
                    {isSelected && (
                      <View className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-bold text-lg ${isSelected ? "text-white" : "text-zinc-400"}`}
                    >
                      {pack.product.title}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-1">
                      {pack.product.description}
                    </Text>
                  </View>

                  <View className="items-end pl-2">
                    <Text
                      className={`font-black text-xl italic ${isSelected ? "text-white" : "text-zinc-400"}`}
                    >
                      {pack.product.priceString}
                    </Text>
                    <Text className="text-zinc-500 text-[10px] mt-0.5">
                      {isAnnual ? "/ year" : "/ month"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* --- フッター --- */}
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/90 border-t border-zinc-900/50 backdrop-blur-xl pb-10">
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading || isPro} // タップ無効化
            className={`w-full h-14 rounded-full items-center justify-center flex-row transition-all ${
              isPro
                ? "bg-zinc-900 border border-zinc-800" // Pro: 暗いグレー + 枠線 (沈んでいる表現)
                : loading
                  ? "bg-zinc-800"
                  : "bg-amber-400 shadow-lg shadow-amber-400/20" // 通常: 明るいアンバー + 影 (浮いている表現)
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                {/* Proならチェックマーク (色は控えめなグレー) */}
                {isPro && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#71717a"
                    style={{ marginRight: 8 }}
                  />
                )}

                {/* テキスト */}
                <Text
                  className={`${isPro ? "text-zinc-500" : "text-black"} font-black text-base uppercase tracking-widest mr-2`}
                >
                  {isPro ? "Current Plan" : "Subscribe Now"}
                </Text>

                {/* 矢印 (未購入時のみ) */}
                {!isPro && (
                  <Ionicons name="arrow-forward" size={20} color="black" />
                )}
              </>
            )}
          </TouchableOpacity>

          {/* Proの場合は注釈を消す */}
          {!isPro && (
            <Text className="text-zinc-600 text-[10px] text-center mt-4">
              Recurring billing, cancel anytime.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
