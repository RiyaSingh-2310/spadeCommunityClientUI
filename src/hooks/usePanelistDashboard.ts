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
import { getRequestErrorMessage } from '../utils/apiErrors';

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

interface RewardSummary {
  totalCredit: number;
  totalDebit: number;
  totalBalance: number;
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

function toFiniteNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function usePanelistDashboard() {
  const { user, updateUser } = usePanelistAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<RedeemRequestItem[]>([]);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings | null>(null);
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null);
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

      if (historyRes.summary) {
        setRewardSummary({
          totalCredit: toFiniteNumber(historyRes.summary.total_credit),
          totalDebit: toFiniteNumber(historyRes.summary.total_debit),
          totalBalance: toFiniteNumber(historyRes.summary.total_balance, profile.balance_point),
        });
      } else {
        setRewardSummary(null);
      }
    } catch (loadError) {
      setError(
        getRequestErrorMessage(loadError, 'Unable to load dashboard data right now. Please refresh and try again.')
      );
      setRewardHistory([]);
      setRedeemRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [historyPage, redeemPage, updateUser]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Refresh balances/history when user returns to the tab (e.g. after admin approval).
  useEffect(() => {
    let timer: number | undefined;

    const scheduleRefresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          void loadDashboard();
        }
      }, 350);
    };

    window.addEventListener('focus', scheduleRefresh);
    document.addEventListener('visibilitychange', scheduleRefresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', scheduleRefresh);
      document.removeEventListener('visibilitychange', scheduleRefresh);
    };
  }, [loadDashboard]);

  const stats = useMemo<DashboardStats>(() => {
    const pageCredit = rewardHistory
      .filter((item) => Number(item.reward_points) > 0)
      .reduce((sum, item) => sum + Number(item.reward_points), 0);

    const availableBalance = toFiniteNumber(
      user?.balance_point ?? rewardSummary?.totalBalance,
      0
    );
    const totalEarned = rewardSummary
      ? rewardSummary.totalCredit
      : pageCredit;
    const totalRedeemed = rewardSummary
      ? rewardSummary.totalDebit
      : Math.max(0, totalEarned - availableBalance);
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
  }, [rewardHistory, redeemRequests, rewardSummary, user?.balance_point]);

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
