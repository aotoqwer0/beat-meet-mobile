import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { supabase } from "../../lib/supabase";

// 表示用の型定義
type ChatPreview = {
  id: string; // 相手のユーザーID
  username: string; // 相手の名前
  avatar_url: string | null;
  lastMessage: string; // 最新のメッセージ内容
  timestamp: string; // 最新のメッセージ日時
};

export default function MessagesScreen() {
  const router = useRouter();
  const { session } = useRequireAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [session]),
  );

  const fetchConversations = async () => {
    if (!session?.user) return;
    const myId = session.user.id;

    try {
      setLoading(true);

      // 1. 自分に関わるメッセージを取得（新しい順）
      // ※ 本格的なアプリでは「最新の会話一覧を取得するRPC（データベース関数）」を作るのが一般的ですが、
      //    ここでは簡易的に「直近のメッセージを取得してクライアント側で集計」します。
      const { data: messages, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order("created_at", { ascending: false })
        .limit(100); // 直近100件から会話相手を探す

      if (msgError) throw msgError;

      // 2. メッセージを相手ごとにグループ化し、最新の1件だけを残す
      const conversationMap = new Map<
        string,
        { lastMessage: string; timestamp: string }
      >();
      const partnerIds = new Set<string>();
      const orderedPartnerIds: string[] = []; // 表示順序を保持するため

      messages?.forEach((msg) => {
        // 相手のIDを特定（自分が送信者なら相手はreceiver、自分が受信者なら相手はsender）
        const partnerId =
          msg.sender_id === myId ? msg.receiver_id : msg.sender_id;

        // まだリストになければ追加（＝これがその相手との最新メッセージ）
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            lastMessage: msg.content,
            timestamp: msg.created_at,
          });
          partnerIds.add(partnerId);
          orderedPartnerIds.push(partnerId);
        }
      });

      if (partnerIds.size === 0) {
        setChats([]);
        return;
      }

      // 3. 相手のプロフィール情報を取得
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", Array.from(partnerIds));

      if (profileError) throw profileError;

      // 4. データを結合して表示用リストを作成
      const formattedChats: ChatPreview[] = orderedPartnerIds
        .map((partnerId) => {
          const profile = profiles?.find((p) => p.id === partnerId);
          const conv = conversationMap.get(partnerId);

          if (!profile || !conv) return null;

          return {
            id: partnerId,
            username: profile.username || "Unknown User",
            avatar_url: profile.avatar_url,
            lastMessage: conv.lastMessage,
            timestamp: conv.timestamp,
          };
        })
        .filter((item): item is ChatPreview => item !== null);

      setChats(formattedChats);
    } catch (e) {
      console.error("Error fetching chats:", e);
    } finally {
      setLoading(false);
    }
  };

  // 日時のフォーマット関数（例: "14:30" や "Yesterday"）
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <View className="flex-1 bg-black pt-14">
      <View className="px-4 py-4 border-b border-zinc-900 flex-row justify-between items-center">
        <Text className="text-white text-3xl font-black italic">Messages</Text>

        {/* 新規チャット作成ボタン（検索画面へ飛ばすなど） */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
          <Ionicons name="create-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/message/${item.id}`)}
              className="flex-row items-center mb-6"
            >
              {/* アバター */}
              <View className="relative">
                <Image
                  source={{
                    uri: item.avatar_url || "https://via.placeholder.com/150",
                  }}
                  className="w-14 h-14 rounded-full bg-zinc-800"
                />
              </View>

              {/* テキスト情報 */}
              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white text-base font-bold">
                    {item.username}
                  </Text>
                  <Text className="text-zinc-500 text-xs">
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
                <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-50">
              <Ionicons name="chatbubbles-outline" size={64} color="#71717a" />
              <Text className="text-zinc-500 mt-4 text-center">
                No messages yet.{"\n"}Find artists to chat with!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
