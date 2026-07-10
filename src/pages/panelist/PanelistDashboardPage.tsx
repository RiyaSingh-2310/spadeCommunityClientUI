import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  Gift,
  History,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react';
import AnimatedPoints from '../../components/panelist/AnimatedPoints';
import StatusBadge from '../../components/panelist/StatusBadge';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import type { PanelistUser } from '../../utils/panelistSession';
import './PanelistPortal.css';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getProfileCompletion(user: PanelistUser | null | undefined) {
  if (!user) return 0;
  let score = 0;
  if (user.name?.trim()) score += 25;
  if (user.email?.trim()) score += 25;
  if (user.phone?.trim()) score += 25;
  if (user.profile_image || user.photo) score += 25;
  return score;
}

function getLastActivityLabel(
  surveyDates: string[],
  redemptionDates: string[]
): string {
  const timestamps = [...surveyDates, ...redemptionDates]
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  if (timestamps.length === 0) return '—';

  return formatDate(new Date(Math.max(...timestamps)).toISOString());
}

type ActivityItem = {
  id: string;
  kind: 'survey' | 'redeem';
  title: string;
  meta: string;
  sortKey: number;
};

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function PanelistDashboardPage() {
  const {
    user,
    isLoading,
    error,
    stats,
    surveyActivity,
    redemptionHistory,
    historyPage,
    historyTotalPages,
    setHistoryPage,
  } = usePanelistDashboard();

  const profileCompletion = getProfileCompletion(user);
  const redemptionRequestCount =
    stats.pendingRedemptions + stats.approvedRedemptions + stats.rejectedRedemptions;

  const pendingSurveys = useMemo(() => {
    const questionnaire = (user?.questionnaire || '').toLowerCase();
    if (!questionnaire || questionnaire.includes('complete') || questionnaire.includes('done')) {
      return 0;
    }
    return 1;
  }, [user?.questionnaire]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const surveyItems: ActivityItem[] = surveyActivity.map((row) => ({
      id: `survey-${row.id}`,
      kind: 'survey',
      title: 'Survey completed',
      meta: `${row.surveyName} · +${row.rewardEarned.toLocaleString()} pts · ${row.completionDate}`,
      sortKey: new Date(row.completionDate).getTime() || 0,
    }));

    const redeemItems: ActivityItem[] = redemptionHistory.map((row) => ({
      id: `redeem-${row.id}`,
      kind: 'redeem',
      title: 'Redemption request submitted',
      meta: `${row.rewardAmount.toLocaleString()} pts via ${row.method} · ${row.requestDate}`,
      sortKey: new Date(row.requestDate).getTime() || 0,
    }));

    return [...surveyItems, ...redeemItems]
      .sort((a, b) => b.sortKey - a.sortKey)
      .slice(0, 6);
  }, [surveyActivity, redemptionHistory]);

  const lastActivity = getLastActivityLabel(
    surveyActivity.map((row) => row.completionDate),
    redemptionHistory.map((row) => row.requestDate)
  );

  return (
    <section className="pdash container-wide pdash-fade-in" aria-live="polite">
      <motion.header
        className="pdash-hero"
        {...fadeUp}
        transition={{ duration: 0.4 }}
      >
        <div className="pdash-hero__inner">
          <div className="pdash-hero__copy">
            <p className="pdash-hero__eyebrow">
              <Sparkles size={13} aria-hidden="true" />
              Dashboard
            </p>
            <h1 className="pdash-hero__title">Welcome back, {user?.name || 'Panelist'}</h1>
            <p className="pdash-hero__subtitle">
              Your research profile is active. Track rewards, surveys, and redemption activity in one place.
            </p>
            <div className="pdash-hero__meta">
              <span className="pdash-hero__meta-item pdash-hero__meta-item--status">
                <Sparkles size={13} aria-hidden="true" />
                {user?.status || 'Active'}
              </span>
              <span className="pdash-hero__meta-item">
                <Calendar size={13} aria-hidden="true" />
                Member since {formatDate(user?.created_at)}
              </span>
              <span className="pdash-hero__meta-item">
                <Clock size={13} aria-hidden="true" />
                Last activity {lastActivity}
              </span>
            </div>
          </div>
          <div className="pdash-hero__avatar" aria-hidden="true">
            {user?.profile_image || user?.photo ? (
              <img src={user.profile_image ?? user.photo ?? ''} alt="" />
            ) : (
              <UserRound size={24} />
            )}
          </div>
        </div>
      </motion.header>

      {error ? (
        <div className="pdash-error" role="alert">
          {error}
        </div>
      ) : null}

      <motion.section
        className="pdash__section"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-labelledby="pdash-rewards-heading"
      >
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-rewards-heading">Reward overview</h2>
            <p>Your earnings and available balance at a glance.</p>
          </div>
        </div>
        <div className="pdash-rewards">
          <article className="pdash-reward-card">
            <div className="pdash-reward-card__icon">
              <Gift size={18} aria-hidden="true" />
            </div>
            <p className="pdash-reward-card__label">Total Rewards Earned</p>
            {isLoading ? (
              <div className="pdash-skeleton pdash-skeleton--value" aria-hidden="true" />
            ) : (
              <AnimatedPoints value={stats.totalEarned} className="pdash-reward-card__value" />
            )}
            <p className="pdash-reward-card__desc">Lifetime points earned from research participation.</p>
          </article>

          <article className="pdash-reward-card pdash-reward-card--cyan">
            <div className="pdash-reward-card__icon">
              <History size={18} aria-hidden="true" />
            </div>
            <p className="pdash-reward-card__label">Total Rewards Redeemed</p>
            {isLoading ? (
              <div className="pdash-skeleton pdash-skeleton--value" aria-hidden="true" />
            ) : (
              <AnimatedPoints value={stats.totalRedeemed} className="pdash-reward-card__value" />
            )}
            <p className="pdash-reward-card__desc">Points you have already redeemed or withdrawn.</p>
          </article>

          <article className="pdash-reward-card pdash-reward-card--emerald">
            <div className="pdash-reward-card__icon">
              <Wallet size={18} aria-hidden="true" />
            </div>
            <p className="pdash-reward-card__label">Available Reward Balance</p>
            {isLoading ? (
              <div className="pdash-skeleton pdash-skeleton--value" aria-hidden="true" />
            ) : (
              <AnimatedPoints value={stats.availableBalance} className="pdash-reward-card__value" />
            )}
            <p className="pdash-reward-card__desc">Points ready to redeem right now.</p>
          </article>
        </div>
      </motion.section>

      <motion.section
        className="pdash__section"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.1 }}
        aria-labelledby="pdash-insights-heading"
      >
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-insights-heading">Dashboard insights</h2>
            <p>Progress across surveys, redemptions, and your profile.</p>
          </div>
        </div>
        <div className="pdash-insights">
          <article className="pdash-insight">
            <div className="pdash-insight__top">
              <span className="pdash-insight__label">Surveys Completed</span>
              <span className="pdash-insight__value">{isLoading ? '—' : stats.surveysCompleted}</span>
            </div>
            <div className="pdash-insight__bar" aria-hidden="true">
              <div
                className="pdash-insight__bar-fill"
                style={{ width: `${Math.min(100, stats.surveysCompleted * 15)}%` }}
              />
            </div>
          </article>

          <article className="pdash-insight">
            <div className="pdash-insight__top">
              <span className="pdash-insight__label">Pending Surveys</span>
              <span className="pdash-insight__value">{isLoading ? '—' : pendingSurveys}</span>
            </div>
            <div className="pdash-insight__bar" aria-hidden="true">
              <div
                className="pdash-insight__bar-fill"
                style={{ width: `${pendingSurveys > 0 ? 40 : 8}%` }}
              />
            </div>
          </article>

          <article className="pdash-insight">
            <div className="pdash-insight__top">
              <span className="pdash-insight__label">Redemption Requests</span>
              <span className="pdash-insight__value">{isLoading ? '—' : redemptionRequestCount}</span>
            </div>
            <div className="pdash-insight__bar" aria-hidden="true">
              <div
                className="pdash-insight__bar-fill"
                style={{ width: `${Math.min(100, redemptionRequestCount * 20)}%` }}
              />
            </div>
          </article>

          <article className="pdash-insight">
            <div className="pdash-insight__top">
              <span className="pdash-insight__label">Profile Completion</span>
              <span className="pdash-insight__value">{isLoading ? '—' : `${profileCompletion}%`}</span>
            </div>
            <div className="pdash-insight__bar" aria-hidden="true">
              <div className="pdash-insight__bar-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
          </article>
        </div>
      </motion.section>

      <motion.section
        className="pdash__section"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.14 }}
        aria-labelledby="pdash-actions-heading"
      >
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-actions-heading">Quick actions</h2>
            <p>Common tasks to manage your rewards and account.</p>
          </div>
        </div>
        <div className="pdash-actions">
          <Link to="/redeem-rewards" className="pdash-action">
            <span className="pdash-action__icon">
              <Gift size={18} aria-hidden="true" />
            </span>
            <span className="pdash-action__text">
              <strong>Redeem Rewards</strong>
              <span>Request a payout from your balance</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>

          <Link to="/redeem-history" className="pdash-action">
            <span className="pdash-action__icon">
              <History size={18} aria-hidden="true" />
            </span>
            <span className="pdash-action__text">
              <strong>View Redemption History</strong>
              <span>Track request status and payouts</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>

          <Link to="/settings" className="pdash-action">
            <span className="pdash-action__icon">
              <Settings size={18} aria-hidden="true" />
            </span>
            <span className="pdash-action__text">
              <strong>Update Profile</strong>
              <span>Edit personal info and security</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>
        </div>
      </motion.section>

      <motion.div
        className="pdash-main"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.18 }}
      >
        <section className="pdash-panel" aria-labelledby="pdash-activity-heading">
          <div className="pdash-panel__head">
            <h2 id="pdash-activity-heading">Recent activity</h2>
            <p>Latest surveys and redemption events.</p>
          </div>
          {isLoading ? (
            <div className="pdash-skeleton pdash-skeleton--activity" aria-hidden="true" />
          ) : recentActivity.length === 0 ? (
            <div className="pdash-activity__empty">No recent activity yet. Complete a survey to get started.</div>
          ) : (
            <div className="pdash-activity">
              {recentActivity.map((item, index) => (
                <article key={item.id} className="pdash-activity__item">
                  <div className="pdash-activity__marker">
                    <span
                      className={`pdash-activity__dot pdash-activity__dot--${item.kind === 'survey' ? 'survey' : 'redeem'}`}
                    />
                    {index < recentActivity.length - 1 ? <span className="pdash-activity__line" /> : null}
                  </div>
                  <div>
                    <p className="pdash-activity__title">{item.title}</p>
                    <p className="pdash-activity__meta">{item.meta}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="pdash-panel" aria-labelledby="pdash-surveys-heading">
          <div className="pdash-panel__head">
            <h2 id="pdash-surveys-heading">Recent surveys</h2>
            <p>Your latest completed survey activity.</p>
          </div>
          {isLoading ? (
            <div className="pdash-skeleton pdash-skeleton--table" aria-hidden="true" />
          ) : surveyActivity.length === 0 ? (
            <div className="pdash-empty">
              <div className="pdash-empty__icon">
                <ClipboardList size={20} aria-hidden="true" />
              </div>
              <p className="pdash-empty__title">No survey activity yet</p>
              <p className="pdash-empty__desc">Completed surveys and earned rewards will appear here.</p>
            </div>
          ) : (
            <>
              <div className="pdash-table-wrap">
                <table className="pdash-table">
                  <thead>
                    <tr>
                      <th>Survey</th>
                      <th>Completed</th>
                      <th>Reward</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveyActivity.map((row) => (
                      <tr key={row.id}>
                        <td>{row.surveyName}</td>
                        <td>{row.completionDate}</td>
                        <td className="pdash-table__reward">{row.rewardEarned.toLocaleString()} pts</td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {historyTotalPages > 1 ? (
                <div className="pdash-pagination">
                  <button
                    type="button"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {historyPage} of {historyTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={historyPage >= historyTotalPages}
                    onClick={() => setHistoryPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </motion.div>
    </section>
  );
}
