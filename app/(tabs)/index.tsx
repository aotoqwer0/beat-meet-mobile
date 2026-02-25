import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

import { UISong } from "../../types";

import { useMusicPlayer } from "../../hooks/useMusicPlayer";

import { useRouter } from "expo-router";
import FeaturedTracksGrid from "../../components/Home/FeaturedTracksGrid";
import HeroSection from "../../components/Home/HeroSection";
import MoodGenreGrid from "../../components/Home/MoodGenreGrid";

export default function HomeScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ボタン用のリフレッシュ状態
  const insets = useSafeAreaInsets();

  const { playSong } = useMusicPlayer();

  // 初回ロードのみ実行 (依存配列が空なので起動時の一回だけ)
  useEffect(() => {
    fetchSongs();
  }, []);

  // 引っ張って更新用
  const onPullToRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSongs(true); // 強制リロード
    setRefreshing(false);
  }, []);

  // ボタン更新用
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchSongs(true); // 強制リロード
    setRefreshing(false);
  };

  async function fetchSongs(isRefresh = false) {
    try {
      // リフレッシュ以外でデータがない時だけローディング表示
      if (!isRefresh && songs.length === 0) setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select(
          `
                    *,
                    profiles:profiles!songs_artist_id_fkey (username)
                `,
        )
        .limit(20)
        .order("created_at", { ascending: false });

      if (songsError) throw songsError;

      const likedSongIds = new Set<string>();
      if (userId) {
        const { data: likesData } = await supabase
          .from("likes")
          .select("song_id")
          .eq("user_id", userId);

        if (likesData) {
          likesData.forEach((like) => likedSongIds.add(like.song_id));
        }
      }

      const formattedSongs: UISong[] = (songsData || []).map((item: any) => {
        let songUrl = item.audio_path;

        if (item.audio_path && !item.audio_path.startsWith("http")) {
          const { data } = supabase.storage
            .from("uploads")
            .getPublicUrl(item.audio_path);
          songUrl = data.publicUrl;
        }

        return {
          id: item.id,
          title: item.title,
          artist_name: item.profiles?.username || "Unknown Artist",
          artist_id: item.artist_id,
          song_url: songUrl,
          cover_image_url: item.artwork_url || item.cover_image_url,
          duration_seconds: item.duration_seconds,
          play_count: item.play_count || 0,
          like_count: item.like_count || 0,
          liked: likedSongIds.has(item.id),
          tags: [],
        };
      });

      const validSongs = formattedSongs.filter(
        (s) => s.song_url && s.song_url !== "",
      );
      setSongs(validSongs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
      // RefreshControlの状態解除は呼び出し元で行うためここでは行わないのが一般的ですが、
      // 今回はstate管理の都合上、非同期完了として扱う
    }
  }

  // const handleStartListening = () => {
  //   if (songs.length === 0) {
  //     Alert.alert("No songs", "There are no songs to play.");
  //     return;
  //   }
  //   const randomIndex = Math.floor(Math.random() * songs.length);
  //   playSong(songs[randomIndex]);
  // };
  const handleStartListening = () => {
    router.push("/shorts"); // 👈 Shorts画面へ
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor="#fbbf24"
          />
        }
      >
        <View className="mt-4 mb-4 px-4" />

        <HeroSection onStartListening={handleStartListening} />

        <MoodGenreGrid onTagSelect={(tag) => console.log("Selected:", tag)} />

        {loading ? (
          <ActivityIndicator size="large" color="#fbbf24" className="mt-10" />
        ) : (
          <FeaturedTracksGrid
            songs={songs}
            onPlay={(song) => playSong(song)}
            // 👇 更新ボタン用の関数と状態を渡す
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
          />
        )}

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}
