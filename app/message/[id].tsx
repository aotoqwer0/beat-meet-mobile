import { Ionicons } from "@expo/vector-icons";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router"; // useFocusEffect追加
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { supabase } from "../../lib/supabase";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useRequireAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const myId = session?.user?.id;
  const partnerId = Array.isArray(id) ? id[0] : id;

  // ▼ 追加: 画面表示時にセッションチェック
  useFocusEffect(
    useCallback(() => {
      supabase.auth
        .getSession()
        .then(({ data: { session: currentSession } }) => {
          if (!currentSession) {
            router.replace("/login");
          }
        });
    }, []),
  );

  // 1. 初回読み込み & リアルタイム購読
  useEffect(() => {
    if (!myId || !partnerId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`,
        )
        .order("created_at", { ascending: true });

      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${myId}:${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${myId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === partnerId) {
            setMessages((prev) => [...prev, newMessage]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, partnerId]);

  // 2. 自動スクロール
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        200,
      );
    }
  }, [messages]);

  // 3. 送信処理
  const sendMessage = async () => {
    if (!inputText.trim() || !myId || !partnerId) return;

    const content = inputText.trim();
    setInputText("");

    const tempId = Date.now().toString();
    const tempMsg: Message = {
      id: tempId,
      content: content,
      sender_id: myId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase.from("messages").insert({
      sender_id: myId,
      receiver_id: partnerId,
      content: content,
    });

    if (error) {
      console.error("Send error:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fbbf24" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Header --- */}
      <SafeAreaView className="bg-zinc-900 border-b border-zinc-800">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white font-bold text-base">Message</Text>
            <Text className="text-zinc-500 text-[10px] uppercase tracking-wider">
              Super Fan Connection
            </Text>
          </View>

          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="zinc-800" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- Chat Area --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isMe = item.sender_id === myId;
          return (
            <View
              className={`mb-4 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
            >
              <View
                className={`px-4 py-3 rounded-2xl ${
                  isMe
                    ? "bg-amber-400 rounded-tr-none"
                    : "bg-zinc-800 rounded-tl-none"
                }`}
              >
                <Text
                  className={`text-base ${isMe ? "text-black font-medium" : "text-white"}`}
                >
                  {item.content}
                </Text>
              </View>
              <Text
                className={`text-[10px] text-zinc-500 mt-1 ${isMe ? "text-right" : "text-left"}`}
              >
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="mt-20 items-center opacity-50">
            <Text className="text-zinc-500">No messages yet.</Text>
            <Text className="text-zinc-600 text-xs mt-1">
              Start the conversation!
            </Text>
          </View>
        }
      />

      {/* --- Input Area --- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="bg-zinc-900 p-4 border-t border-zinc-800 flex-row items-center pb-8">
          <TouchableOpacity className="mr-3">
            <Ionicons name="add-circle-outline" size={28} color="#71717a" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-black text-white px-4 py-3 rounded-full border border-zinc-700 max-h-24"
            placeholder="Send a message..."
            placeholderTextColor="#52525b"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim() ? "bg-amber-400" : "bg-zinc-800"
            }`}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputText.trim() ? "black" : "#52525b"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
