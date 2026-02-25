import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { initRevenueCat } from "../lib/revenuecat"; // 設定係をインポート
import { supabase } from "../lib/supabase";

// ★ ここを RevenueCat の Entitlements 設定と完全に一致させる
const ENTITLEMENT_ID = "pro";

export const useSubscription = () => {
  const [isPro, setIsPro] = useState(false);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------
  // 1. 初期化とデータ取得
  // ---------------------------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);

        // A. RevenueCatの初期化
        await initRevenueCat();

        // B. ユーザーIDの紐付け (Supabase Auth IDを使用)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await Purchases.logIn(user.id);
        }

        // C. 現在の会員情報の取得
        const info = await Purchases.getCustomerInfo();
        if (mounted) {
          setCustomerInfo(info);
          checkEntitlements(info);
        }

        // D. メニュー（Offerings）の取得
        const offerings = await Purchases.getOfferings();
        if (mounted && offerings.current) {
          setCurrentOffering(offerings.current);
        }
      } catch (e) {
        console.error("Subscription Init Error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // リアルタイム監視
    const updateListener = (info: CustomerInfo) => {
      if (mounted) {
        setCustomerInfo(info);
        checkEntitlements(info);
      }
    };
    Purchases.addCustomerInfoUpdateListener(updateListener);

    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------------------
  // 2. 権限チェック & Supabase同期
  // ---------------------------------------------
  const checkEntitlements = async (info: CustomerInfo) => {
    // ここで 'pro' 権限を持っているかチェック
    const hasPro =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsPro(hasPro);

    // Supabase側の plan_id も同期
    await syncWithSupabase(hasPro);
  };

  const syncWithSupabase = async (isProStatus: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_id")
      .eq("id", user.id)
      .single();

    const currentPlan = profile?.plan_id;
    // DB上の値は 'monthly_pro' としていますが、必要ならここも調整してください
    const shouldBe = isProStatus ? "monthly_pro" : "free";

    if (currentPlan !== shouldBe) {
      console.log(`Syncing Subscription: ${currentPlan} -> ${shouldBe}`);
      await supabase
        .from("profiles")
        .update({ plan_id: shouldBe })
        .eq("id", user.id);
    }
  };

  // ---------------------------------------------
  // 3. 購入アクション
  // ---------------------------------------------
  const purchase = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      // A. Proプラン (Entitlement ID 'pro' が付与されたか確認)
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert("Success", "BeatMeet Proへようこそ！");
        checkEntitlements(customerInfo);
      }

      // B. 消耗型チケット (IDに 'ticket' が含まれる場合)
      if (pkg.product.identifier.includes("ticket")) {
        await handleTicketPurchase(pkg);
      }

      // C. スーパーフォロー (IDに 'sf_tier' が含まれる場合)
      if (pkg.product.identifier.includes("sf_tier")) {
        Alert.alert("Thanks!", "アーティストへの支援ありがとうございます！");
        // TODO: フォロー処理
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Error", e.message);
      }
    }
  };

  // ---------------------------------------------
  // 4. チケット付与ロジック
  // ---------------------------------------------
  const handleTicketPurchase = async (pkg: PurchasesPackage) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const count = 1; // 必要に応じてpkg.identifierで分岐

    const { error } = await supabase.rpc("add_tickets", {
      count: count,
      user_id: user.id,
    });

    if (error) {
      console.error("Ticket Add Error:", error);
      Alert.alert(
        "エラー",
        "購入は完了しましたが、チケット付与に失敗しました。",
      );
    } else {
      Alert.alert("完了", `${count}枚のチケットを追加しました！`);
    }
  };

  // ---------------------------------------------
  // 5. リストア
  // ---------------------------------------------
  const restore = async () => {
    try {
      setLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      checkEntitlements(info);
      Alert.alert("復元完了", "購入情報を復元しました。");
    } catch (e: any) {
      Alert.alert("エラー", e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isPro,
    currentOffering,
    customerInfo,
    loading,
    purchase,
    restore,
  };
};
