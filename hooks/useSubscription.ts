import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { PLAN_CONFIG } from "../lib/subscription";
import { supabase } from "../lib/supabase";

// デモ用パッケージ情報
const MOCK_PACKAGES = [
  {
    identifier: "monthly_pro",
    product: {
      identifier: "monthly_pro",
      priceString: "$4.99",
      title: "Monthly Pro",
      description: "Unlock full access for 1 month",
    },
    packageType: "MONTHLY",
  },
];

export function useSubscription() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      // 1. 本番用のRevenueCat初期化処理は一旦スキップし、デモデータを使用
      setPackages(MOCK_PACKAGES);

      // 2. DBから現在のステータスを取得
      await checkDbStatus();
    } catch (e) {
      console.log("Subscription init error:", e);
    } finally {
      setLoading(false);
    }
  };

  const checkDbStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("plan_id")
        .eq("id", user.id)
        .single();

      const planId = data?.plan_id || "free";
      setCurrentPlan(planId);

      // 設定ファイルを見て、adFreeがtrueならProとみなす
      const config = PLAN_CONFIG[planId] || PLAN_CONFIG["free"];
      setIsPro(config.adFree);
    }
  };

  // 購入処理 (デモ)
  const purchasePackage = async (pack: any) => {
    setLoading(true);
    try {
      // 擬似的な通信待ち
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // DBを直接更新して「買ったこと」にする (デモ用)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // plan_id を更新
        await supabase
          .from("profiles")
          .update({
            plan_id: pack.product.identifier, // 'monthly_pro'
            subscription_status: "active", // 互換性のため残す
          })
          .eq("id", user.id);
      }

      await checkDbStatus(); // 状態再取得
      Alert.alert("Success", "Welcome to BeatMeet Pro!");
      return true;
    } catch (e: any) {
      Alert.alert("Error", e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Restore", "Purchases restored successfully.");
    }, 1500);
  };

  return {
    packages,
    isPro,
    currentPlan,
    loading,
    purchasePackage,
    restorePurchases,
  };
}
