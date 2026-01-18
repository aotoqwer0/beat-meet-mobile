import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import TrackPlayer from "react-native-track-player";
import AppHeader from "../components/AppHeader";
import "../global.css";
import { supabase } from "../lib/supabase";

TrackPlayer.registerPlaybackService(() => require("../service"));

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. 起動時にセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2.ログイン状態の変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 初期化中(チェック中)はローディングを表示
  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />

      {/* 修正前: ここに <AppHeader /> があったためエラーになっていました */}

      <Stack
        screenOptions={{
          // ▼ 修正: AppHeaderをStackの機能として組み込む
          header: () => <AppHeader />,
          headerShown: true, // ヘッダーを表示
          contentStyle: { backgroundColor: "black" }, // 背景色
        }}
      >
        {/* メインのタブ画面 (ヘッダーあり) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />

        {/* --- ヘッダーを表示したくない画面 (全画面モーダルなど) --- */}
        <Stack.Screen
          name="subscription/paywall"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="login"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="signup"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="terms"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="privacy"
          options={{ presentation: "modal", headerShown: false }}
        />

        {/* 検索画面やメッセージ画面など、ヘッダーを表示したい画面は設定不要（デフォルトで表示） */}
        <Stack.Screen name="search/index" options={{ headerShown: true }} />
        <Stack.Screen name="messages/index" options={{ headerShown: true }} />
        <Stack.Screen name="message/[id]" options={{ headerShown: true }} />
      </Stack>
    </>
  );
}
