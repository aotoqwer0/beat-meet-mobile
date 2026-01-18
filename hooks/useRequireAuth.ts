import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export function useRequireAuth() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 常に最新のセッション状態を持っておく
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * アクション実行前のガード関数
   * @param action ログイン済みの場合に実行したい関数
   */
  const requireAuth = (action: () => void) => {
    if (session) {
      action();
    } else {
      Alert.alert(
        "ログインが必要です",
        "この機能を利用するにはログインまたは登録が必要です。",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "ログインする",
            onPress: () => router.push('/login') // ログイン画面へ
          }
        ]
      );
    }
  };

  return { session, requireAuth };
}