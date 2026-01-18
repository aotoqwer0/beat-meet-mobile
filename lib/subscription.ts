export type PlanId = "free" | "monthly_pro" | "yearly_pro";

export const PLAN_CONFIG: Record<
  string,
  {
    label: string;
    uploadLimit: number;
    superFollowSlots: number;
    adFree: boolean;
  }
> = {
  free: {
    label: "Free",
    uploadLimit: 1, // 月1曲 (仮)
    superFollowSlots: 0,
    adFree: false,
  },
  monthly_pro: {
    label: "Pro (Monthly)",
    uploadLimit: 10, // 無制限
    superFollowSlots: 1, // 1枠付帯
    adFree: true,
  },
  yearly_pro: {
    label: "Pro (Yearly)",
    uploadLimit: 10,
    superFollowSlots: 1,
    adFree: true,
  },
};

// ユーザーのプラン情報と追加枠から、最終的な権限を計算するヘルパー
export const getUserEntitlements = (
  planId: string = "free",
  extraSlots: number = 0,
) => {
  const config = PLAN_CONFIG[planId] || PLAN_CONFIG["free"];

  return {
    ...config,
    totalSuperFollowSlots: config.superFollowSlots + extraSlots,
  };
};
