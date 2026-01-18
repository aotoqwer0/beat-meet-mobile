import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUploadData } from "../../../context/UploadContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { useUploadUsage } from "../../../hooks/useUploadUsage";
import { supabase } from "../../../lib/supabase"; // 👈 追加

export default function Step1Audio() {
  const router = useRouter();
  const { session } = useRequireAuth();
  const { file, setFile, setTitle, setCurrentStep } = useUploadData();

  const { usage, limit, isBlocked, loading } = useUploadUsage();
  const remaining = Math.max(0, limit - usage);
  const progressPercent = Math.min(100, (usage / limit) * 100);

  const pickAudio = async () => {
    if (isBlocked) {
      Alert.alert(
        "Limit Reached",
        "You have reached your monthly upload limit.",
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: false,
      });
      if (!result.canceled) {
        const picked = result.assets[0];
        setFile(picked);
        setTitle(picked.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    if (!file) return Alert.alert("Required", "Please select an audio file.");
    router.push("/(tabs)/upload/details");
  };

  useFocusEffect(
    useCallback(() => {
      // ▼ 修正: 画面表示時にセッションチェック
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.replace("/login"); // 未ログインなら飛ばす
        }
      });
      setCurrentStep(1);
    }, []),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fbbf24" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-8 mb-8">
          <Text className="text-white text-3xl font-black italic tracking-tighter">
            UPLOAD <Text className="text-amber-400">MUSIC</Text>
          </Text>
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-2">
            Step 1: Select Audio
          </Text>
        </View>

        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10 shadow-sm">
          <View className="flex-row justify-between items-end mb-4">
            <View>
              <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Monthly Uploads
              </Text>
              <Text className="text-white text-3xl font-black italic">
                {usage} <Text className="text-zinc-600 text-xl">/ {limit}</Text>
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg ${isBlocked ? "bg-red-500/10 border border-red-500/20" : "bg-green-500/10 border border-green-500/20"}`}
            >
              <Text
                className={`${isBlocked ? "text-red-400" : "text-green-400"} text-[10px] font-bold uppercase tracking-wider`}
              >
                {isBlocked ? "Limit Reached" : `${remaining} left`}
              </Text>
            </View>
          </View>
          <View className="h-3 bg-black rounded-full overflow-hidden border border-zinc-800">
            <View
              className={`h-full rounded-full ${isBlocked ? "bg-red-500" : "bg-amber-400"}`}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        {isBlocked ? (
          <View className="w-full aspect-square bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800 items-center justify-center p-8">
            <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center mb-6">
              <Ionicons name="lock-closed" size={32} color="#ef4444" />
            </View>
            <Text className="text-white text-xl font-bold mb-2 text-center">
              Upload Limit Reached
            </Text>
            <Text className="text-zinc-500 text-center mb-8 text-sm leading-6">
              You've reached your limit for this month.{"\n"}Upgrade to Pro for
              unlimited uploads.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/subscription/paywall")}
              className="bg-amber-400 px-8 py-4 rounded-full flex-row items-center shadow-lg shadow-amber-400/20"
            >
              <Text className="text-black font-black uppercase tracking-wider mr-2">
                Go Premium
              </Text>
              <Ionicons name="arrow-forward" size={18} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickAudio}
            activeOpacity={0.8}
            className="w-full aspect-square bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-700 items-center justify-center relative overflow-hidden group"
          >
            <LinearGradient
              colors={["rgba(251, 191, 36, 0.05)", "transparent"]}
              className="absolute inset-0"
            />
            {file ? (
              <View className="items-center p-6 w-full">
                <View className="w-24 h-24 rounded-full bg-amber-400/10 items-center justify-center mb-6 border border-amber-400/30 shadow-lg shadow-amber-400/10">
                  <Ionicons name="musical-note" size={40} color="#fbbf24" />
                </View>
                <View className="bg-black/40 px-4 py-2 rounded-lg mb-3 max-w-full">
                  <Text
                    className="text-white font-bold text-xl text-center"
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {file.name}
                  </Text>
                </View>
                <View className="bg-amber-400 px-4 py-2 rounded-full">
                  <Text className="text-black text-xs font-black uppercase tracking-wider">
                    Change File
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <View className="w-24 h-24 bg-zinc-800 rounded-full items-center justify-center mb-6 border border-zinc-700 shadow-lg">
                  <Ionicons name="cloud-upload" size={40} color="#fbbf24" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2">
                  Select Audio
                </Text>
                <Text className="text-zinc-500 text-sm font-medium">
                  MP3, WAV, AIFF (Max 50MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {!isBlocked && (
        <SafeAreaView
          edges={["bottom"]}
          className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-zinc-900 p-6 backdrop-blur-xl"
        >
          <TouchableOpacity
            onPress={handleNext}
            className={`w-full py-4 rounded-full items-center flex-row justify-center ${file ? "bg-amber-400 shadow-lg shadow-amber-400/20" : "bg-zinc-800"}`}
            disabled={!file}
          >
            <Text
              className={`font-black text-base uppercase tracking-widest mr-2 ${file ? "text-black" : "text-zinc-500"}`}
            >
              Next Step
            </Text>
            {file && <Ionicons name="arrow-forward" size={20} color="black" />}
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}
