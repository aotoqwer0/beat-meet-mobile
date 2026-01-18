import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Linking,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MiniPlayer from "../../components/Player/MiniPlayer";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { API_BASE_URL } from "../../lib/config";
import { supabase } from "../../lib/supabase"; // 👈 これを追加しました！
import { UISong } from "../../types";

type ArtistProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_WIDTH * 0.7;

export default function ArtistPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useRequireAuth();
  const { playSong, currentTrack } = useMusicPlayer();

  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [songs, setSongs] = useState<UISong[]>([]);
  const [loading, setLoading] = useState(true);

  const [following, setFollowing] = useState(false);
  const [superFollowing, setSuperFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id && session) fetchArtistData();
  }, [id, session]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const token = session?.access_token;

      const res = await fetch(`${cleanBaseUrl}/api/profile/${id}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });

      if (!res.ok) throw new Error("Failed to fetch artist data");

      const data = await res.json();
      setProfile(data.profile);
      setSongs(data.songs || []);
      setFollowing(data.following);
      setSuperFollowing(data.superFollowing);
      setFollowerCount(data.followerCount);
      setIsOwner(data.isOwner);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not load artist data.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (isOwner) return;
    setFollowing(!following);
    setFollowerCount((prev) => (following ? prev - 1 : prev + 1));
    try {
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const token = session?.access_token;
      await fetch(`${cleanBaseUrl}/api/follows`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followeeId: id }),
      });
    } catch (e) {
      setFollowing(!following); // Revert
    }
  };

  // スーパーフォロー実行
  const toggleSuperFollow = async () => {
    if (isOwner) return;

    const prevState = superFollowing;
    setSuperFollowing(!superFollowing);

    try {
      const { data, error } = await supabase.rpc("toggle_super_follow", {
        target_artist_id: id,
      });

      if (error) throw error;

      if (data.error) {
        setSuperFollowing(prevState);

        if (data.code === 402) {
          Alert.alert(
            "Beat Meet Pro Required",
            "Subscribe to Beat Meet Pro to Super Follow this artist.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Go to Shop",
                onPress: () => router.push("/subscription/paywall"),
              },
            ],
          );
        } else if (data.code === 403) {
          Alert.alert(
            "Limit Reached",
            "You have used all your Super Follow slots.",
          );
        } else {
          Alert.alert("Notice", data.error);
        }
      } else {
        if (data.superFollowing) {
          if (!following) {
            setFollowing(true);
            setFollowerCount((prev) => prev + 1);
          }
          Alert.alert("Super Followed!", "You can now message this artist.");
        }
      }
    } catch (e: any) {
      console.error(e);
      setSuperFollowing(prevState);
      Alert.alert("Error", "Network error.");
    }
  };

  // 👇 メッセージボタンの処理 (スーパーフォロー限定)
  const handleMessage = () => {
    if (!superFollowing) {
      Alert.alert(
        "Exclusive Feature",
        "Only Super Followers can send direct messages to this artist.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Super Follow", onPress: toggleSuperFollow },
        ],
      );
      return;
    }

    // スーパーフォローしていればチャット画面へ
    router.push(`/message/${id}`);
  };

  const openWebsite = () => {
    if (profile?.website_url)
      Linking.openURL(profile.website_url).catch(() => {});
  };

  const renderHeader = () => {
    if (!profile) return null;

    return (
      <View className="relative bg-black pb-4">
        <View style={{ height: HEADER_HEIGHT }} className="w-full relative">
          <Image
            source={{
              uri: profile.avatar_url || "https://via.placeholder.com/800x800",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)", "#000000"]}
            locations={[0.5, 0.8, 1]}
            className="absolute inset-0"
          />
        </View>

        <View className="px-6 -mt-16 relative z-10">
          <View className="flex-row justify-start mb-3">
            <View className="flex-row items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <View className="bg-amber-400 p-1 rounded-full mr-2">
                <Ionicons name="musical-notes" size={10} color="black" />
              </View>
              <Text className="text-amber-400 text-[10px] font-black tracking-[2px] uppercase">
                Artist
              </Text>
            </View>
            {superFollowing && (
              <View className="flex-row items-center bg-pink-600/90 px-3 py-1.5 rounded-full border border-pink-500/50 backdrop-blur-md ml-2">
                <Ionicons
                  name="heart"
                  size={10}
                  color="white"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-white text-[10px] font-black tracking-[1px] uppercase">
                  Super Fan
                </Text>
              </View>
            )}
          </View>

          <Text
            className="text-white font-black italic tracking-tighter leading-none shadow-xl mb-6"
            style={{
              fontSize: 42,
              textShadowColor: "rgba(0, 0, 0, 0.7)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 8,
            }}
            numberOfLines={2}
          >
            {profile.username}
          </Text>

          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-baseline">
                <Text className="text-white text-2xl font-black tracking-tight leading-none mr-2">
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(followerCount)}
                </Text>
                <Text className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Followers
                </Text>
              </View>
              {profile.website_url && (
                <TouchableOpacity
                  onPress={openWebsite}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center"
                >
                  <Ionicons name="globe-outline" size={20} color="#e4e4e7" />
                </TouchableOpacity>
              )}
            </View>

            {!isOwner ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={toggleFollow}
                  className={`flex-1 h-12 rounded-xl flex-row items-center justify-center border ${following ? "bg-zinc-900 border-zinc-800" : "bg-zinc-800 border-zinc-700"}`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wider ${following ? "text-white" : "text-zinc-400"}`}
                  >
                    {following ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>

                {/* Super Follow Button */}
                <TouchableOpacity
                  onPress={toggleSuperFollow}
                  className="flex-1 h-12 rounded-xl overflow-hidden relative items-center justify-center"
                >
                  {!superFollowing && (
                    <LinearGradient
                      colors={["#ec4899", "#be185d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="absolute inset-0"
                    />
                  )}
                  {superFollowing && (
                    <View className="absolute inset-0 bg-pink-900/50 border border-pink-500/50 rounded-xl" />
                  )}
                  <View className="flex-row items-center">
                    <Ionicons
                      name={superFollowing ? "heart" : "heart-outline"}
                      size={16}
                      color="white"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-white text-xs font-black uppercase tracking-wider">
                      {superFollowing ? "Super Followed" : "Super Follow"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Message Button */}
                <TouchableOpacity
                  onPress={handleMessage}
                  className={`w-12 h-12 rounded-xl items-center justify-center border ${superFollowing ? "bg-zinc-800 border-zinc-700" : "bg-black/40 border-zinc-800 opacity-50"}`}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color={superFollowing ? "white" : "#71717a"}
                  />
                  {!superFollowing && (
                    <View className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-0.5">
                      <Ionicons name="lock-closed" size={10} color="#fbbf24" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                className="h-12 w-full rounded-xl flex-row items-center justify-center bg-zinc-900 border border-zinc-800"
              >
                <Text className="text-zinc-300 text-sm font-bold uppercase tracking-wider">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {profile.bio && (
            <View className="mb-8">
              <Text className="text-zinc-300 text-sm leading-6 font-medium">
                {profile.bio}
              </Text>
            </View>
          )}
          <View className="flex-row items-center pt-4 border-t border-zinc-900/60">
            <Ionicons
              name="play-circle"
              size={18}
              color="#fbbf24"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white text-sm font-bold uppercase tracking-widest">
              Popular Songs
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSongItem = ({ item, index }: { item: UISong; index: number }) => {
    const isPlayingThis = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => playSong(item)}
        activeOpacity={0.7}
        className="flex-row items-center px-6 py-4 border-b border-zinc-900/40"
      >
        <Text
          className={`w-8 text-center text-lg font-black italic mr-5 ${isPlayingThis ? "text-amber-400" : "text-zinc-600"}`}
        >
          {index + 1}
        </Text>
        <View className="relative shadow-sm">
          <Image
            source={{
              uri: item.cover_image_url || "https://via.placeholder.com/150",
            }}
            className="w-16 h-16 rounded-xl bg-zinc-800 mr-5 border border-zinc-800/50"
          />
          {isPlayingThis && (
            <View className="absolute inset-0 bg-black/60 rounded-xl items-center justify-center mr-5 border-2 border-amber-400">
              <Ionicons name="volume-high" size={24} color="#fbbf24" />
            </View>
          )}
        </View>
        <View className="flex-1 justify-center mr-4">
          <Text
            className={`text-lg font-bold mb-1.5 ${isPlayingThis ? "text-amber-400" : "text-white"}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Ionicons
              name="headset"
              size={13}
              color="#71717a"
              style={{ marginRight: 5 }}
            />
            <Text className="text-zinc-500 text-sm font-medium">
              {new Intl.NumberFormat("en-US", { notation: "compact" }).format(
                item.play_count,
              )}{" "}
              plays
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-3 -mr-3 opacity-60">
          <Ionicons name="ellipsis-vertical" size={20} color="#e4e4e7" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="absolute top-0 left-0 z-50" edges={["top"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="ml-5 mt-3 w-11 h-11 rounded-full bg-black/60 items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg active:bg-black/80"
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="white"
            style={{ marginLeft: -2 }}
          />
        </TouchableOpacity>
      </SafeAreaView>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View className="h-40" />}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ListEmptyComponent={
          <View className="px-6 py-20 items-center justify-center opacity-60">
            <Ionicons
              name="musical-notes-outline"
              size={56}
              color="#52525b"
              style={{ marginBottom: 16 }}
            />
            <Text className="text-zinc-500 font-bold text-lg tracking-wider">
              No songs released yet.
            </Text>
          </View>
        }
      />
      <MiniPlayer />
    </View>
  );
}
