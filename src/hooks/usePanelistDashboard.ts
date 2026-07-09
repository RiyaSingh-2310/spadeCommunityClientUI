import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createRedeemRequest,
  getMyProfile,
  getMyRedeemRequests,
  getMyRewardHistory,
  getRewardSettings,
  type RedeemRequestItem,
  type RewardHistoryItem,
  type RewardSettings,
} from '../api/panelist';
import { usePanelistAuth } from '../context/PanelistAuthContext';

export interface SurveyActivityRow {
  id: string;
  surveyName: string;
  completionDate: string;
  rewardEarned: number;
  status: string;
}

export interface RedemptionHistoryRow {
  id: number;
  requestDate: string;
  rewardAmount: number;
  method: string;
  status: string;
}

export interface DashboardStats {
  totalEarned: number;
  totalRedeemed: number;
  availableBalance: number;
  surveysCompleted: number;
  pendingRedemptions: number;
  approvedRedemptions: number;
  rejectedRedemptions: number;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function mapSurveyRow(item: RewardHistoryItem): SurveyActivityRow | null {
  const type = (item.transaction_type || '').toLowerCase();
  const isCredit = type.includes('credit') || Number(item.reward_points) > 0;
  if (!isCredit) return null;

  return {
    id: String(item.id),
    surveyName: item.reward_type?.trim() || `Survey Activity #${item.id}`,
    completionDate: formatDate(item.created_at),
    rewardEarned: Math.max(0, Number(item.reward_points) || 0),
    status: item.status || 'Completed',
  };
}

function mapRedemptionRow(item: RedeemRequestItem): RedemptionHistoryRow {
  return {
    id: item.id,
    requestDate: formatDate(item.created_at),
    rewardAmount: Number(item.reward_points) || 0,
    method: item.remark?.trim() || 'Points Redemption',
    status: item.status || 'Pending',
  };
}

function countByStatus(requests: RedeemRequestItem[], matcher: (s: string) => boolean) {
  return requests.filter((item) => matcher((item.status || '').toLowerCase())).length;
}

export function usePanelistDashboard() {
  const { user, updateUser } = usePanelistAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<RedeemRequestItem[]>([]);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [redeemPage, setRedeemPage] = useState(1);
  const [redeemTotalPages, setRedeemTotalPages] = useState(1);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [profile, historyRes, redeemRes, settingsRes] = await Promise.all([
        getMyProfile(),
        getMyRewardHistory(historyPage, 10),
        getMyRedeemRequests(redeemPage, 10),
        getRewardSettings().catch(() => null),
      ]);

      updateUser(profile);
      setRewardHistory(historyRes.data ?? []);
      setRedeemRequests(redeemRes.data ?? []);
      setHistoryTotalPages(historyRes.totalPages || 1);
      setRedeemTotalPages(redeemRes.totalPages || 1);
      setRewardSettings(settingsRes);
    } catch {
      setError('Unable to load dashboard data right now.');
      setRewardHistory([]);
      setRedeemRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [historyPage, redeemPage, updateUser]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo<DashboardStats>(() => {
    const summaryCredit = rewardHistory
      .filter((item) => Number(item.reward_points) > 0)
      .reduce((sum, item) => sum + Number(item.reward_points), 0);

    const totalEarned = summaryCredit;
    const availableBalance = Number(user?.balance_point ?? 0);
    const totalRedeemed = Math.max(0, totalEarned - availableBalance);
    const surveysCompleted = rewardHistory.filter((item) => {
      const type = (item.transaction_type || '').toLowerCase();
      return type.includes('credit') || Number(item.reward_points) > 0;
    }).length;

    return {
      totalEarned,
      totalRedeemed,
      availableBalance,
      surveysCompleted,
      pendingRedemptions: countByStatus(redeemRequests, (s) => s.includes('pending')),
      approvedRedemptions: countByStatus(redeemRequests, (s) => s.includes('approv') || s.includes('complete')),
      rejectedRedemptions: countByStatus(redeemRequests, (s) => s.includes('reject')),
    };
  }, [rewardHistory, redeemRequests, user?.balance_point]);

  const surveyActivity = useMemo(
    () => rewardHistory.map(mapSurveyRow).filter((row): row is SurveyActivityRow => row !== null),
    [rewardHistory]
  );

  const redemptionHistory = useMemo(
    () => redeemRequests.map(mapRedemptionRow),
    [redeemRequests]
  );

  const redemptionMethods = useMemo(() => {
    const methods = ['Bank Transfer', 'UPI', 'Gift Card'];
    if (rewardSettings?.paypal_enabled) methods.push('PayPal');
    if (rewardSettings?.amazon_enabled) methods.push('Amazon Gift Card');
    if (rewardSettings?.flipkart_enabled) methods.push('Flipkart Gift Card');
    return methods;
  }, [rewardSettings]);

  const submitRedemption = useCallback(
    async (payload: { reward_points: number; remark?: string; comment?: string }) => {
      const response = await createRedeemRequest(payload);
      await loadDashboard();
      return response;
    },
    [loadDashboard]
  );

  return {
    user,
    isLoading,
    error,
    stats,
    surveyActivity,
    redemptionHistory,
    rewardSettings,
    redemptionMethods,
    historyPage,
    historyTotalPages,
    redeemPage,
    redeemTotalPages,
    setHistoryPage,
    setRedeemPage,
    reload: loadDashboard,
    submitRedemption,
  };
}
