import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Sliderがない場合は一旦Viewでモックアップするか、`npm install @react-native-community/slider` してください。
// 今回は標準のView等でシークバーの見た目だけ作りますが、本格的にはSlider推奨です。

import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { supabase } from "../../lib/supabase";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Comment = {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function FullPlayer({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    position,
    duration,
    seekTo,
  } = useMusicPlayer();
  const { session, requireAuth } = useRequireAuth();

  const [activeTab, setActiveTab] = useState<"controls" | "comments">(
    "controls",
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // 曲が変わったらコメント再取得
  useEffect(() => {
    if (visible && currentTrack && activeTab === "comments") {
      fetchComments();
    }
  }, [currentTrack?.id, visible, activeTab]);

  const fetchComments = async () => {
    if (!currentTrack) return;
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles (username, avatar_url)
        `,
        )
        .eq("song_id", currentTrack.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments((data as any) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !currentTrack || !session?.user) return;

    try {
      const { error } = await supabase.from("comments").insert({
        song_id: currentTrack.id,
        user_id: session.user.id,
        body: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      fetchComments(); // リロード
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
    }
  };

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* 背景ブラー的な演出 */}
        <View className="absolute inset-0 opacity-30">
          <Image
            source={{ uri: currentTrack.cover_image_url }}
            className="w-full h-full"
            blurRadius={20}
          />
          <View className="absolute inset-0 bg-black/80" />
        </View>

        {/* ヘッダー (閉じるボタン) */}
        <View
          style={{ paddingTop: insets.top }}
          className="flex-row justify-between items-center px-6 py-4 z-10"
        >
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="chevron-down" size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
            Now Playing
          </Text>
          <TouchableOpacity
            onPress={() =>
              setActiveTab(activeTab === "controls" ? "comments" : "controls")
            }
            className="p-2"
          >
            <Ionicons
              name={
                activeTab === "comments"
                  ? "musical-notes"
                  : "chatbubble-ellipses-outline"
              }
              size={26}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* メインコンテンツ */}
        {activeTab === "controls" ? (
          // --- プレイヤー操作画面 ---
          <View className="flex-1 justify-center px-8 pb-20">
            {/* Artwork */}
            <View className="w-full aspect-square rounded-2xl shadow-2xl shadow-amber-500/20 mb-10 overflow-hidden border border-white/10">
              <Image
                source={{
                  uri:
                    currentTrack.cover_image_url ||
                    "https://via.placeholder.com/400",
                }}
                className="w-full h-full"
              />
            </View>

            {/* Info */}
            <View className="mb-8">
              <Text
                className="text-white text-3xl font-black italic leading-tight mb-1"
                numberOfLines={2}
              >
                {currentTrack.title}
              </Text>
              <Text className="text-zinc-400 text-lg font-medium">
                {currentTrack.artist_name}
              </Text>
            </View>

            {/* Progress (簡易実装: Sliderコンポーネントがあれば差し替え推奨) */}
            <View className="mb-2">
              <View className="h-1 bg-zinc-800 rounded-full w-full overflow-hidden mb-2">
                <View
                  className="h-full bg-amber-400"
                  style={{ width: `${(position / duration) * 100}%` }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-zinc-500 text-xs font-mono">
                  {formatTime(position)}
                </Text>
                <Text className="text-zinc-500 text-xs font-mono">
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View className="flex-row items-center justify-between mt-6">
              <TouchableOpacity onPress={skipToPrevious}>
                <Ionicons name="play-skip-back" size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                className="w-20 h-20 rounded-full bg-amber-400 items-center justify-center shadow-lg shadow-amber-400/40"
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={36}
                  color="black"
                  style={{ marginLeft: isPlaying ? 0 : 4 }}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={skipToNext}>
                <Ionicons name="play-skip-forward" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- コメント画面 ---
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="flex-1 px-4">
              <Text className="text-white text-xl font-bold mb-4 px-2">
                Comments
              </Text>

              {loadingComments ? (
                <ActivityIndicator color="#fbbf24" className="mt-10" />
              ) : (
                <ScrollView className="flex-1">
                  {comments.length === 0 ? (
                    <View className="items-center py-10 opacity-50">
                      <Text className="text-zinc-500">
                        No comments yet. Be the first!
                      </Text>
                    </View>
                  ) : (
                    comments.map((comment) => (
                      <View key={comment.id} className="flex-row mb-6">
                        <Image
                          source={{
                            uri:
                              comment.profiles?.avatar_url ||
                              "https://via.placeholder.com/100",
                          }}
                          className="w-10 h-10 rounded-full bg-zinc-800 mr-3"
                        />
                        <View className="flex-1 bg-zinc-900/80 p-3 rounded-2xl rounded-tl-none">
                          <Text className="text-zinc-400 text-xs font-bold mb-1">
                            {comment.profiles?.username || "Unknown"}
                          </Text>
                          <Text className="text-white text-sm leading-5">
                            {comment.body}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                  <View className="h-10" />
                </ScrollView>
              )}

              {/* コメント入力エリア */}
              <View
                className="py-4 border-t border-zinc-800 bg-black flex-row items-center"
                style={{ paddingBottom: insets.bottom + 10 }}
              >
                <TextInput
                  className="flex-1 bg-zinc-900 text-white rounded-full px-4 py-3 mr-3 border border-zinc-800"
                  placeholder="Add a comment..."
                  placeholderTextColor="#52525b"
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity
                  onPress={() => requireAuth(postComment)}
                  disabled={!newComment.trim()}
                  className={`w-10 h-10 rounded-full items-center justify-center ${newComment.trim() ? "bg-amber-400" : "bg-zinc-800"}`}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={newComment.trim() ? "black" : "#52525b"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}
