import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { supabase } from "../../lib/supabase";
import { UISong } from "../../types";

// 検索カテゴリ
type SearchCategory = "all" | "songs" | "artists";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { playSong, currentTrack } = useMusicPlayer();

  const initialQuery = (params.query as string) || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>("all");
  const [loading, setLoading] = useState(false);

  const [songResults, setSongResults] = useState<UISong[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);

  // 検索実行
  const performSearch = async (text: string) => {
    if (!text.trim()) {
      setSongResults([]);
      setArtistResults([]);
      return;
    }

    setLoading(true);
    try {
      const cleanText = text.trim();
      const searchPattern = `%${cleanText}%`;

      if (category === "all" || category === "songs") {
        const { data: songs } = await supabase
          .from("songs")
          .select("*, profiles!songs_artist_id_fkey(username)")
          .ilike("title", searchPattern)
          .limit(10);

        if (songs) {
          const formattedSongs = songs.map((s: any) => ({
            id: s.id,
            title: s.title,
            artist_name: s.profiles?.username || "Unknown",
            artist_id: s.artist_id,
            cover_image_url: s.artwork_url || s.cover_image_url,
            audio_path: s.audio_path,
          })) as UISong[];
          setSongResults(formattedSongs);
        }
      }

      if (category === "all" || category === "artists") {
        const { data: artists } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", searchPattern)
          .limit(10);

        if (artists) setArtistResults(artists);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, category]);

  const handlePlaySong = async (song: UISong) => {
    let trackToPlay = { ...song };
    if (!trackToPlay.song_url && (song as any).audio_path) {
      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl((song as any).audio_path);
      trackToPlay.song_url = data.publicUrl;
    }
    playSong(trackToPlay);
  };

  return (
    <View className="flex-1 bg-black">
      {/* AppHeaderが上にあるので、ここには独自の検索バーだけ置く */}
      <View className="py-4 px-4 bg-black border-b border-zinc-900">
        <View className="flex-row items-center space-x-3 gap-3">
          <View className="flex-1 flex-row items-center bg-zinc-900 rounded-full px-4 h-12 border border-zinc-800">
            <Ionicons name="search" size={20} color="#71717a" />
            <TextInput
              className="flex-1 ml-2 text-white font-medium h-full"
              placeholder="Search songs, artists..."
              placeholderTextColor="#52525b"
              value={query}
              onChangeText={setQuery}
              autoFocus={!initialQuery}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>
          {/* キャンセル（戻る）ボタン */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-zinc-400 text-sm font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* フィルタータブ */}
        <View className="flex-row mt-4 space-x-2 gap-2">
          {(["all", "songs", "artists"] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full border ${
                category === cat
                  ? "bg-amber-400 border-amber-400"
                  : "bg-zinc-900 border-zinc-700"
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  category === cat ? "text-black" : "text-zinc-400"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 検索結果 */}
      {loading ? (
        <View className="mt-10">
          <ActivityIndicator color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
          data={[
            ...(category !== "artists"
              ? songResults.map((s) => ({ type: "song", data: s }))
              : []),
            ...(category !== "songs"
              ? artistResults.map((a) => ({ type: "artist", data: a }))
              : []),
          ]}
          keyExtractor={(item: any) => `${item.type}-${item.data.id}`}
          renderItem={({ item }: any) => {
            if (item.type === "song") {
              const song = item.data as UISong;
              const isPlayingThis = currentTrack?.id === song.id;
              return (
                <TouchableOpacity
                  onPress={() => handlePlaySong(song)}
                  className="flex-row items-center mb-4 bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50"
                >
                  <Image
                    source={{
                      uri:
                        song.cover_image_url ||
                        "https://via.placeholder.com/150",
                    }}
                    className="w-14 h-14 rounded-lg bg-zinc-800"
                  />
                  <View className="flex-1 ml-3">
                    <Text
                      className={`font-bold text-sm mb-1 ${isPlayingThis ? "text-amber-400" : "text-white"}`}
                    >
                      {song.title}
                    </Text>
                    <Text className="text-zinc-500 text-xs">
                      {song.artist_name}
                    </Text>
                  </View>
                  <TouchableOpacity className="p-2">
                    <Ionicons
                      name="play-circle"
                      size={24}
                      color={isPlayingThis ? "#fbbf24" : "#e4e4e7"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            } else {
              const artist = item.data;
              return (
                <TouchableOpacity
                  onPress={() => router.push(`/artist/${artist.id}`)}
                  className="flex-row items-center mb-4 p-2"
                >
                  <Image
                    source={{
                      uri:
                        artist.avatar_url || "https://via.placeholder.com/150",
                    }}
                    className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-bold text-base">
                      {artist.username}
                    </Text>
                    <Text className="text-zinc-500 text-xs">Artist</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#52525b" />
                </TouchableOpacity>
              );
            }
          }}
          ListEmptyComponent={
            query ? (
              <Text className="text-zinc-500 text-center mt-10">
                No results found.
              </Text>
            ) : (
              <View className="items-center justify-center mt-20 opacity-40">
                <Ionicons name="search" size={48} color="#52525b" />
                <Text className="text-zinc-500 mt-4 font-medium">
                  Search for music
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
