// hooks/useUploadUsage.ts

import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { PLAN_CONFIG } from "../lib/subscription";
import { supabase } from "../lib/supabase";

export function useUploadUsage() {
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkUsage();
    }, []),
  );

  const checkUsage = async () => {
    try {
      // 毎回ローディングを出すとチラつくので、初回以外は裏で更新する等の調整も可能ですが、
      // ここでは確実にチェックするためシンプルに実装します。
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. プロフィールからプランを取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_id")
        .eq("id", user.id)
        .single();

      const planId = profile?.plan_id || "free";
      const config = PLAN_CONFIG[planId] || PLAN_CONFIG["free"];
      setLimit(config.uploadLimit);

      // 2. 「今月」の開始日時 (現地時間の1日)
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      // 3. 今月のアップロード数をカウント
      const { count, error } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true })
        .eq("artist_id", user.id)
        .gte("created_at", startOfMonth);

      if (error) throw error;

      const currentUsage = count || 0;
      setUsage(currentUsage);

      // 上限以上ならブロック
      setIsBlocked(currentUsage >= config.uploadLimit);
    } catch (e) {
      console.error("Usage check failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { usage, limit, isBlocked, loading };
}
