// lib/revenuecat.ts
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

// RevenueCatのダッシュボードから取得したキー
const API_KEYS = {
  apple: "test_UKKouwGevwZGwcpWFQLsJWnkSCM", // ここにコピーしたキーを入れる
  google: "goog_xxxxxxxxxxxxxxxxxxxxxx", // Android用（後で設定）
};

export const initRevenueCat = async () => {
  // すでに初期化済みなら何もしないチェックを入れても良い

  const apiKey = Platform.select({
    ios: API_KEYS.apple,
    android: API_KEYS.google,
  });

  if (apiKey) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG); // 開発中はログ出す
    await Purchases.configure({ apiKey });
    console.log("RevenueCat Configured!");
  }
};
