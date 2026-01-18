import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { API_BASE_URL } from "../../lib/config";
import { APP_MOODS } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { UISong } from "../../types";

const GENRES = ["All", ...APP_MOODS.map((m) => m.label)];

export default function RankingsScreen() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");
  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { playSong, currentTrack, isPlaying } = useMusicPlayer();
  // useRequireAuth から session も取得できますが、
  // ここでは fetchRankings 内で確実に最新を取得する形を維持します。
  const { session } = useRequireAuth();

  const fetchRankings = async () => {
    try {
      if (!refreshing) setLoading(true);

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      // ▼ 修正: ログインしていない場合はログイン画面へ飛ばして終了
      if (!currentSession) {
        setLoading(false);
        // ユーザー体験を損なわないよう、少し待ってから飛ばすか、あるいはここで即座に飛ばす
        // Alert.alert("Login Required", "Please login to view rankings.");
        router.replace("/login");
        return;
      }

      const token = currentSession.access_token;
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

      const res = await fetch(
        `${cleanBaseUrl}/api/rankings?genre=${encodeURIComponent(activeGenre)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // ▼ 修正: 401(認証エラー)などが返ってきてもアプリをクラッシュさせない
      if (!res.ok) {
        if (res.status === 401) {
          console.log("Unauthorized access to rankings. Redirecting...");
          router.replace("/login");
          return;
        }
        console.error(`API Error: ${res.status} ${res.statusText}`);
        return; // throw せずに静かに終了
      }

      const data = await res.json();
      setSongs(data.songs || []);
    } catch (e) {
      console.error("Fetch Rankings Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [activeGenre]);

  useFocusEffect(
    useCallback(() => {
      // 画面に戻ってきた時に再チェック（必要に応じてコメントアウト解除）
      // fetchRankings();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRankings();
  }, [activeGenre]);

  // --- UI Components ---
  // (ここは変更なし)
  const renderHeader = () => (
    <View className="pt-2 pb-4">
      <View className="px-6 mb-6">
        <View className="flex-row items-center mb-1">
          <Ionicons
            name="trophy"
            size={16}
            color="#fbbf24"
            style={{ marginRight: 6 }}
          />
          <Text className="text-amber-400 text-xs font-bold tracking-[4px] uppercase">
            Monthly Charts
          </Text>
        </View>
        <Text className="text-white text-4xl font-black italic tracking-tighter shadow-md leading-none">
          TOP 50 <Text className="text-zinc-700">///</Text>
        </Text>
        <Text className="text-zinc-400 text-xs mt-2 font-medium">
          Top 5 artists qualify for the{" "}
          <Text className="text-amber-400 font-bold">LIVE STAGE</Text> next
          month.
        </Text>
      </View>

      <FlatList
        data={GENRES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveGenre(item)}
            className={`px-4 py-2 rounded-full border ${
              activeGenre === item
                ? "bg-amber-400 border-amber-400"
                : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <Text
              className={`text-xs font-bold uppercase tracking-wider ${
                activeGenre === item ? "text-black" : "text-zinc-400"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderRankingItem = ({
    item,
    index,
  }: {
    item: UISong;
    index: number;
  }) => {
    const rank = index + 1;
    const isQualified = rank <= 5;
    const isPlayingThis = currentTrack?.id === item.id;

    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => playSong(item)}
          className={`flex-row items-center mx-4 mb-3 p-3 rounded-2xl border relative overflow-hidden ${
            isQualified
              ? "bg-zinc-900/90 border-amber-500/60 shadow-sm shadow-amber-900/20"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          {isQualified && (
            <View className="absolute top-0 bottom-0 left-0 w-1.5 bg-amber-400" />
          )}

          <View className="w-10 items-center justify-center mr-2 ml-1">
            {rank === 1 ? (
              <Ionicons name="trophy" size={26} color="#fbbf24" />
            ) : rank === 2 ? (
              <Ionicons name="medal" size={26} color="#e4e4e7" />
            ) : rank === 3 ? (
              <Ionicons name="medal" size={26} color="#b45309" />
            ) : (
              <Text
                className={`text-lg font-black italic ${isQualified ? "text-white" : "text-zinc-500"}`}
              >
                {rank}
              </Text>
            )}
          </View>

          <View className="relative">
            <Image
              source={{
                uri: item.cover_image_url || "https://via.placeholder.com/150",
              }}
              className={`w-14 h-14 rounded-lg bg-zinc-800 ${isQualified ? "border border-zinc-600" : ""}`}
            />
            {isPlayingThis && isPlaying && (
              <View className="absolute inset-0 bg-black/60 items-center justify-center rounded-lg backdrop-blur-sm">
                <Ionicons name="stats-chart" size={18} color="#fbbf24" />
              </View>
            )}
          </View>

          <View className="flex-1 ml-4 justify-center">
            <Text
              className="text-white font-bold text-sm mb-0.5 leading-tight pr-2"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center">
              {isQualified && (
                <View className="bg-amber-400/20 px-1.5 py-0.5 rounded mr-2 border border-amber-400/20">
                  <Text className="text-amber-400 text-[8px] font-bold uppercase tracking-wider">
                    Live Ready
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  if (item.artist_id) {
                    router.push(`../artist/${item.artist_id}`);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-zinc-400 text-xs" numberOfLines={1}>
                  {item.artist_name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-end pl-2 min-w-[50px]">
            <View className="flex-row items-center bg-black/40 px-2 py-1 rounded-lg border border-white/5">
              <Ionicons
                name="play"
                size={10}
                color="#fbbf24"
                style={{ marginRight: 4 }}
              />
              <Text className="text-zinc-200 text-xs font-bold font-mono">
                {new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(item.play_count || 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {rank === 5 && (
          <View className="mx-8 my-5 flex-row items-center opacity-70">
            <View className="h-[1px] flex-1 bg-zinc-600" />
            <View className="mx-3 items-center">
              <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                Qualification Cutoff
              </Text>
              <Ionicons name="chevron-down" size={12} color="#71717a" />
            </View>
            <View className="h-[1px] flex-1 bg-zinc-600" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderRankingItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 160 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fbbf24"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-50">
              <Ionicons name="trophy-outline" size={48} color="#52525b" />
              <Text className="text-zinc-500 mt-4 font-bold text-sm uppercase">
                No ranking data yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
