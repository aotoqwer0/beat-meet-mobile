import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { memo, useEffect, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native"; // Pressableに変更
import { useProgress } from "react-native-track-player";

import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { API_BASE_URL } from "../../lib/config";
import FullPlayer from "./FullPlayer"; // 👈 インポート追加

const MiniPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
  } = useMusicPlayer();
  const { requireAuth, session } = useRequireAuth();

  // FullPlayerの開閉状態
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);

  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = 85;
  }

  const { position, duration } = useProgress();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsLiked(currentTrack.liked || false);
    }
  }, [currentTrack?.id]);

  const handleToggleLike = async () => {
    // ... (既存のコードそのまま)
    if (!currentTrack) return;
    const previousLiked = isLiked;
    setIsLiked(!previousLiked);

    try {
      if (!session?.access_token) throw new Error("No token");

      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${cleanBaseUrl}/api/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ songId: currentTrack.id }),
      });

      if (!res.ok) throw new Error("Like failed");
    } catch (error) {
      console.error("Like Error:", error);
      setIsLiked(previousLiked);
      Alert.alert("Error", "Could not update like status.");
    }
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? position / duration : 0;

  return (
    <>
      <View
        className="absolute left-0 right-0"
        style={{ bottom: tabBarHeight }}
      >
        <View className="bg-zinc-900 border-t border-zinc-800 shadow-lg overflow-hidden">
          {/* 上部のプログレスバー */}
          <View className="h-[2px] w-full bg-zinc-800">
            <View
              className="h-full bg-amber-400"
              style={{ width: `${progressPercent * 100}%` }}
            />
          </View>

          {/* 👇 全体をタップ可能にしてフルプレイヤーを開く */}
          <Pressable
            onPress={() => setFullPlayerVisible(true)}
            className="p-3 flex-row items-center"
          >
            {/* Artwork */}
            <View className="relative">
              <Image
                source={{
                  uri:
                    currentTrack.cover_image_url ||
                    "https://via.placeholder.com/100",
                }}
                className={`w-12 h-12 rounded-md bg-zinc-800 ${isPlaying ? "opacity-100" : "opacity-80"}`}
              />
            </View>

            {/* Title & Artist */}
            <View className="flex-1 ml-3 justify-center mr-2">
              <Text
                className="text-white font-bold text-sm leading-tight"
                numberOfLines={1}
              >
                {currentTrack.title}
              </Text>
              <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                {currentTrack.artist_name}
              </Text>
            </View>

            {/* Controls Area (ここは親へのイベント伝播を止める必要はないが、個別ボタンとして機能) */}
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  requireAuth(handleToggleLike);
                }}
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={isLiked ? "#fbbf24" : "#a1a1aa"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="p-2"
              >
                {isPlaying ? (
                  <Ionicons name="pause" size={28} color="#fbbf24" />
                ) : (
                  <Ionicons name="play" size={28} color="#fbbf24" />
                )}
              </TouchableOpacity>

              {/* Nextボタンを追加するとより便利 */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  skipToNext();
                }}
                className="p-2"
              >
                <Ionicons name="play-skip-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </View>

      {/* 👇 FullPlayer モーダル */}
      <FullPlayer
        visible={isFullPlayerVisible}
        onClose={() => setFullPlayerVisible(false)}
      />
    </>
  );
};

export default memo(MiniPlayer);
