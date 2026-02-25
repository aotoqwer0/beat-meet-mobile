import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TrackPlayer from "react-native-track-player"; // 直接制御のため

import { useRequireAuth } from "../../hooks/useRequireAuth";
import { supabase } from "../../lib/supabase";
import { UISong } from "../../types";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ShortsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, requireAuth } = useRequireAuth();

  // 通常のプレイヤーロジックとは少し切り離して管理
  const [songs, setSongs] = useState<UISong[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // 画面が表示されたらデータを取得
  useFocusEffect(
    useCallback(() => {
      fetchShortsFeed();
      return () => {
        TrackPlayer.reset(); // 画面を離れたら停止
      };
    }, []),
  );

  const fetchShortsFeed = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // ランダムに20曲取得 (RPCがあればベストですが、今回は既存songsテーブルから)
      const { data, error } = await supabase
        .from("songs")
        .select("*, profiles!songs_artist_id_fkey(username)")
        .limit(20)
        .order("created_at", { ascending: false }); // 本来はrandom()推奨

      if (error) throw error;
      if (!data) return;

      const formatted: UISong[] = data.map((item: any) => {
        let songUrl = item.audio_path;
        // URL生成ロジック(Homeと同じ)
        if (item.audio_path && !item.audio_path.startsWith("http")) {
          const { data } = supabase.storage
            .from("uploads")
            .getPublicUrl(item.audio_path);
          songUrl = data.publicUrl;
        }
        return {
          id: item.id,
          title: item.title,
          artist_name: item.profiles?.username || "Unknown",
          artist_id: item.artist_id,
          song_url: songUrl,
          cover_image_url: item.artwork_url || item.cover_image_url,
          // ここが重要：ショート再生用の設定
          shorts_start: item.shorts_start || 0,
          shorts_duration: item.shorts_duration || 15,

          duration_seconds: item.duration_seconds,
          play_count: item.play_count,
          like_count: item.like_count,
          liked: false,
          tags: [],
        };
      });

      // song_urlがあるものだけ
      setSongs(formatted.filter((s) => s.song_url));
    } catch (e) {
      console.error(e);
    }
  };

  // スクロール検知：現在表示されている曲を特定して再生
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index ?? 0;
        setActiveIndex(index);
      }
    },
  ).current;

  // activeIndexが変わったら再生
  useFocusEffect(
    useCallback(() => {
      if (songs.length > 0 && songs[activeIndex]) {
        playShort(songs[activeIndex]);
      }
    }, [activeIndex, songs]),
  );

  const playShort = async (song: any) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.id,
        url: song.song_url,
        title: song.title,
        artist: song.artist_name,
        artwork: song.cover_image_url,
      });

      // 指定秒数から開始
      const startPos = song.shorts_start || 0;
      await TrackPlayer.seekTo(startPos);
      await TrackPlayer.play();

      // 終了判定は簡易的に省略（ループ再生などは高度な実装で対応）
      // ※本格実装では useProgress で監視して duration 経過後に seekTo(start) する
    } catch (e) {
      console.error("Shorts play error:", e);
    }
  };

  // いいね機能 (簡易版)
  const toggleLike = () => {
    // UI上だけの演出（実際はAPIを叩く）
    alert("Liked! (Simulated)");
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "relative",
        }}
      >
        {/* 背景画像 */}
        <Image
          source={{
            uri: item.cover_image_url || "https://via.placeholder.com/400",
          }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          className="absolute inset-0"
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0, y: 1 }}
        />

        {/* 右側のコントロールバー */}
        <View className="absolute right-4 bottom-32 items-center space-y-6 gap-6">
          <TouchableOpacity
            onPress={() => router.push(`/artist/${item.artist_id}`)}
            className="items-center"
          >
            <View className="w-12 h-12 rounded-full border-2 border-white overflow-hidden mb-1">
              <Image
                source={{ uri: item.cover_image_url }}
                className="w-full h-full"
              />
            </View>
            <Ionicons
              name="add-circle"
              size={20}
              color="#fbbf24"
              style={{ marginTop: -14 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLike} className="items-center">
            <Ionicons name="heart" size={36} color="white" />
            <Text className="text-white text-xs font-bold shadow">
              {item.like_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <Ionicons name="chatbubble-ellipses" size={34} color="white" />
            <Text className="text-white text-xs font-bold shadow">0</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <Ionicons name="share-social" size={34} color="white" />
            <Text className="text-white text-xs font-bold shadow">Share</Text>
          </TouchableOpacity>
        </View>

        {/* 下部の曲情報 */}
        <View className="absolute left-4 bottom-12 right-20">
          <Text className="text-amber-400 font-black text-sm uppercase tracking-widest mb-2">
            Scanning...
          </Text>
          <Text className="text-white text-3xl font-black italic leading-tight mb-2 shadow-lg">
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="musical-notes" size={16} color="white" />
            <Text className="text-white text-lg font-bold ml-2">
              {item.artist_name}
            </Text>
          </View>
          <Text className="text-zinc-400 text-xs mt-4 w-5/6" numberOfLines={2}>
            Enjoying the preview? Tap to view full song details.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* 戻るボタン (絶対配置) */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ top: insets.top + 10, left: 20, zIndex: 100 }}
        className="absolute p-2 bg-black/20 rounded-full backdrop-blur-md"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled // 👈 これで1ページずつスナップする
        vertical
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}
