import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { API_BASE_URL } from "../../lib/config";
import { supabase } from "../../lib/supabase";
import { UISong } from "../../types";

type LikedSongResponse = {
  id: string;
  title: string;
  artist: string;
  audio_path: string | null;
  coverImage: string | null;
  duration: string;
  duration_seconds: number | null;
  like_count: number;
  play_count: number;
  tags: string[];
  likedAt: string;
};

type FollowedArtistResponse = {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  followers: number;
  songs: number;
  followedAt: string;
};

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tracks" | "artists">("tracks");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [likedSongs, setLikedSongs] = useState<UISong[]>([]);
  const [followedArtists, setFollowedArtists] = useState<
    FollowedArtistResponse[]
  >([]);

  const { playSong, currentTrack, isPlaying } = useMusicPlayer();

  const fetchLibraryData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // ▼ 修正: トークンがない(未ログイン)ならログイン画面へ
      if (!token) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

      if (activeTab === "tracks") {
        const res = await fetch(`${cleanBaseUrl}/api/likes`, {
          method: "GET",
          headers,
        });

        // ▼ 401エラー対応
        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error("Failed to fetch liked songs");
        }

        const data: { songs: LikedSongResponse[] } = await res.json();
        const formattedSongs: UISong[] = data.songs.map((s) => {
          let songUrl = "";
          if (s.audio_path) {
            if (s.audio_path.startsWith("http")) {
              songUrl = s.audio_path;
            } else {
              const { data: urlData } = supabase.storage
                .from("uploads")
                .getPublicUrl(s.audio_path);
              songUrl = urlData.publicUrl;
            }
          }

          return {
            id: s.id,
            title: s.title,
            artist_name: s.artist,
            artist_id: "",
            song_url: songUrl,
            cover_image_url: s.coverImage,
            duration_seconds: s.duration_seconds,
            play_count: s.play_count,
            like_count: s.like_count,
            liked: true,
            tags: s.tags,
          };
        });
        setLikedSongs(formattedSongs);
      } else {
        const res = await fetch(`${cleanBaseUrl}/api/follows/list`, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error("Failed to fetch followed artists");
        }

        const data: { artists: FollowedArtistResponse[] } = await res.json();
        setFollowedArtists(data.artists);
      }
    } catch (e) {
      console.error("Library Fetch Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // 毎回ローディングを出すとチラつくので、loading管理は fetchLibraryData 内に任せる
      fetchLibraryData();
    }, [activeTab]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLibraryData();
  }, [activeTab]);

  // --- UI Components ---
  // (以下、UI部分は変更なし)
  const renderHeader = () => (
    <View className="px-6 pt-6 pb-6">
      <Text className="text-amber-400 text-xs font-bold tracking-[4px] uppercase mb-1">
        Your Collection
      </Text>
      <Text className="text-white text-4xl font-black italic tracking-tighter shadow-md mb-6">
        LIBRARY <Text className="text-zinc-700">///</Text>
      </Text>

      <View className="flex-row bg-zinc-900 rounded-xl p-1 border border-zinc-800">
        <TouchableOpacity
          onPress={() => setActiveTab("tracks")}
          className={`flex-1 py-3 rounded-lg items-center justify-center ${activeTab === "tracks" ? "bg-zinc-800 shadow-sm border border-zinc-700" : ""}`}
        >
          <Text
            className={`font-bold text-xs uppercase tracking-wider ${activeTab === "tracks" ? "text-amber-400" : "text-zinc-500"}`}
          >
            Tracks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("artists")}
          className={`flex-1 py-3 rounded-lg items-center justify-center ${activeTab === "artists" ? "bg-zinc-800 shadow-sm border border-zinc-700" : ""}`}
        >
          <Text
            className={`font-bold text-xs uppercase tracking-wider ${activeTab === "artists" ? "text-amber-400" : "text-zinc-500"}`}
          >
            Artists
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSongItem = ({ item }: { item: UISong }) => {
    const isActiveTrack = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => playSong(item)}
        activeOpacity={0.7}
        className={`flex-row items-center p-3 mb-2 mx-4 rounded-xl border ${isActiveTrack ? "bg-zinc-900 border-amber-400/30" : "bg-transparent border-transparent"}`}
      >
        <Image
          source={{
            uri: item.cover_image_url || "https://via.placeholder.com/150",
          }}
          className="w-14 h-14 rounded-md bg-zinc-800"
        />
        <View className="flex-1 ml-4 justify-center">
          <Text
            className={`font-bold text-base mb-0.5 ${isActiveTrack ? "text-amber-400" : "text-white"}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-zinc-500 text-xs font-medium" numberOfLines={1}>
            {item.artist_name}
          </Text>
        </View>

        {isActiveTrack && isPlaying ? (
          <Ionicons name="stats-chart" size={18} color="#fbbf24" />
        ) : (
          <View className="p-2">
            <Ionicons name="heart" size={20} color="#fbbf24" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderArtistItem = ({ item }: { item: FollowedArtistResponse }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-center p-4 mb-3 mx-4 rounded-xl bg-zinc-900 border border-zinc-800"
    >
      <View className="w-14 h-14 rounded-full bg-black items-center justify-center overflow-hidden border border-zinc-700">
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} className="w-full h-full" />
        ) : (
          <Ionicons name="person" size={24} color="#52525b" />
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-white font-bold text-lg leading-tight">
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-zinc-500 text-xs mr-3">
            {item.followers} Followers
          </Text>
          <Text className="text-zinc-500 text-xs">{item.songs} Songs</Text>
        </View>
      </View>
      <TouchableOpacity className="px-4 py-2 bg-zinc-800 rounded-full border border-zinc-700">
        <Text className="text-zinc-300 text-xs font-bold">View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "tracks" ? likedSongs : (followedArtists as any)}
          keyExtractor={(item) => item.id}
          renderItem={
            activeTab === "tracks" ? renderSongItem : renderArtistItem
          }
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 150 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fbbf24"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-50">
              <Ionicons
                name={activeTab === "tracks" ? "musical-notes" : "people"}
                size={48}
                color="#52525b"
              />
              <Text className="text-zinc-500 mt-4 font-bold text-sm tracking-widest uppercase">
                No{" "}
                {activeTab === "tracks" ? "liked tracks" : "followed artists"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
