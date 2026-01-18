import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

type Conversation = {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageDate: string;
};

export default function MessagesListScreen() {
  const router = useRouter();
  const { session } = useRequireAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!currentSession) {
          router.replace("/login");
          return;
        }
        fetchConversations(currentSession.user.id);
      };
      checkAuth();
    }, []),
  );

  const fetchConversations = async (myId: string) => {
    try {
      setLoading(true);

      // 1. 自分に関係するメッセージを全取得（最新順）
      // 修正箇所: profilesテーブルを sender_id / receiver_id で明示的に結合
      const { data: messages, error } = await supabase
        .from("messages")
        .select(
          `
                    *,
                    sender:profiles!sender_id(id, username, avatar_url),
                    receiver:profiles!receiver_id(id, username, avatar_url)
                `,
        )
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 2. 会話相手ごとにまとめる
      const conversationMap = new Map<string, Conversation>();

      messages.forEach((msg: any) => {
        const isMe = msg.sender_id === myId;
        // sender または receiver が取得できているか確認
        const partner = isMe ? msg.receiver : msg.sender;

        // 相手が存在しない（退会済み等）場合はスキップ
        if (!partner) return;

        const partnerId = partner.id;

        // まだリストになければ追加（降順で取得しているので、最初に来たのが最新メッセージ）
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId: partnerId,
            partnerName: partner.username || "Unknown",
            partnerAvatar: partner.avatar_url,
            lastMessage: msg.content,
            lastMessageDate: msg.created_at,
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() => router.push(`/message/${item.partnerId}`)}
      className="flex-row items-center px-4 py-3 border-b border-zinc-900 bg-black active:bg-zinc-900"
    >
      <Image
        source={{
          uri: item.partnerAvatar || "https://via.placeholder.com/150",
        }}
        className="w-12 h-12 rounded-full bg-zinc-800 mr-4"
      />
      <View className="flex-1">
        <View className="flex-row justify-between mb-1">
          <Text className="text-white font-bold text-base">
            {item.partnerName}
          </Text>
          <Text className="text-zinc-500 text-xs">
            {new Date(item.lastMessageDate).toLocaleDateString()}
          </Text>
        </View>
        <Text className="text-zinc-400 text-sm" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Messages",
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.partnerId}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 opacity-60">
              <Ionicons name="chatbubbles-outline" size={48} color="#71717a" />
              <Text className="text-zinc-500 mt-4 font-medium">
                No messages yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
