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
import DashboardStatCard from '../../components/panelist/DashboardStatCard';
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

function getLastActivityLabel(surveyDates: string[], redemptionDates: string[]) {
  const timestamps = [...surveyDates, ...redemptionDates]
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));
  if (timestamps.length === 0) return '—';
  return formatDate(new Date(Math.max(...timestamps)).toISOString());
}

const fadeUp = {
  initial: { opacity: 0, y: 8 },
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
  const earnProgress =
    stats.totalEarned > 0 ? Math.round((stats.availableBalance / stats.totalEarned) * 100) : 0;
  const redeemProgress =
    stats.totalEarned > 0 ? Math.round((stats.totalRedeemed / stats.totalEarned) * 100) : 0;

  const lastActivity = getLastActivityLabel(
    surveyActivity.map((row) => row.completionDate),
    redemptionHistory.map((row) => row.requestDate)
  );

  return (
    <section className="pdash container-wide pdash-fade-in" aria-live="polite">
      <header className="pdash-header">
        <div className="pdash-header__main">
          <p className="pdash-header__greeting">Welcome back, {user?.name || 'Panelist'}</p>
          <p className="pdash-header__message">
            Your research profile is active — keep participating to earn more rewards.
          </p>
        </div>
        <div className="pdash-header__meta">
          <span className="pdash-header__badge">
            <Sparkles size={12} aria-hidden="true" />
            {user?.status || 'Active'}
          </span>
          <span className="pdash-header__chip">
            <Calendar size={12} aria-hidden="true" />
            Since {formatDate(user?.created_at)}
          </span>
          <span className="pdash-header__chip">
            <Clock size={12} aria-hidden="true" />
            Last activity {lastActivity}
          </span>
        </div>
        <div className="pdash-header__avatar" aria-hidden="true">
          {user?.profile_image || user?.photo ? (
            <img src={user.profile_image ?? user.photo ?? ''} alt="" />
          ) : (
            <UserRound size={20} />
          )}
        </div>
      </header>

      {error ? <div className="pdash-error" role="alert">{error}</div> : null}

      <motion.section className="pdash__section" {...fadeUp} transition={{ duration: 0.35 }} aria-labelledby="pdash-rewards-heading">
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-rewards-heading">Reward overview</h2>
            <p>Your earnings and available balance at a glance.</p>
          </div>
        </div>
        <div className="pdash-kpi-grid">
          <DashboardStatCard icon={<Gift size={18} />} label="Total Rewards Earned" value={stats.totalEarned} loading={isLoading} accent="violet" />
          <DashboardStatCard icon={<History size={18} />} label="Total Rewards Redeemed" value={stats.totalRedeemed} loading={isLoading} accent="cyan" />
          <DashboardStatCard icon={<Wallet size={18} />} label="Available Reward Balance" value={stats.availableBalance} loading={isLoading} accent="emerald" />
        </div>
      </motion.section>

      <motion.section className="pdash__section" {...fadeUp} transition={{ duration: 0.35, delay: 0.04 }} aria-labelledby="pdash-surveys-heading">
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-surveys-heading">Recent survey activity</h2>
            <p>Your latest completed surveys and earned rewards.</p>
          </div>
        </div>
        <article className="pdash-panel">
          {isLoading ? (
            <div className="pdash-skeleton pdash-skeleton--table" aria-hidden="true" />
          ) : surveyActivity.length === 0 ? (
            <div className="pdash-empty">
              <div className="pdash-empty__icon"><ClipboardList size={20} aria-hidden="true" /></div>
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
                        <td><StatusBadge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {historyTotalPages > 1 ? (
                <div className="pdash-pagination">
                  <button type="button" disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span>Page {historyPage} of {historyTotalPages}</span>
                  <button type="button" disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage((p) => p + 1)}>Next</button>
                </div>
              ) : null}
            </>
          )}
        </article>
      </motion.section>

      <motion.section className="pdash__section" {...fadeUp} transition={{ duration: 0.35, delay: 0.08 }} aria-labelledby="pdash-progress-heading">
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-progress-heading">Reward progress</h2>
            <p>Track your balance, redemptions, and profile completion.</p>
          </div>
        </div>
        <div className="pdash-progress-grid">
          <article className="pdash-progress">
            <div className="pdash-progress__top">
              <span>Available balance</span>
              <strong>{isLoading ? '—' : `${earnProgress}%`}</strong>
            </div>
            <div className="pdash-progress__bar"><div className="pdash-progress__fill" style={{ width: `${earnProgress}%` }} /></div>
            <p className="pdash-progress__hint">{stats.availableBalance.toLocaleString()} pts remaining</p>
          </article>
          <article className="pdash-progress">
            <div className="pdash-progress__top">
              <span>Total redeemed</span>
              <strong>{isLoading ? '—' : `${redeemProgress}%`}</strong>
            </div>
            <div className="pdash-progress__bar"><div className="pdash-progress__fill pdash-progress__fill--cyan" style={{ width: `${redeemProgress}%` }} /></div>
            <p className="pdash-progress__hint">{stats.totalRedeemed.toLocaleString()} pts redeemed</p>
          </article>
          <article className="pdash-progress">
            <div className="pdash-progress__top">
              <span>Profile completion</span>
              <strong>{isLoading ? '—' : `${profileCompletion}%`}</strong>
            </div>
            <div className="pdash-progress__bar"><div className="pdash-progress__fill pdash-progress__fill--emerald" style={{ width: `${profileCompletion}%` }} /></div>
            <p className="pdash-progress__hint">{profileCompletion < 100 ? 'Complete your profile for better matches' : 'Profile fully complete'}</p>
          </article>
        </div>
      </motion.section>

      <motion.section className="pdash__section pdash__section--last" {...fadeUp} transition={{ duration: 0.35, delay: 0.12 }} aria-labelledby="pdash-actions-heading">
        <div className="pdash__section-head">
          <div>
            <h2 id="pdash-actions-heading">Quick actions</h2>
            <p>Common tasks to manage your rewards and account.</p>
          </div>
        </div>
        <div className="pdash-actions">
          <Link to="/redeem-rewards" className="pdash-action">
            <span className="pdash-action__icon"><Gift size={18} aria-hidden="true" /></span>
            <span className="pdash-action__text">
              <strong>Redeem Rewards</strong>
              <span>Request a payout from your balance</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>
          <Link to="/redeem-history" className="pdash-action">
            <span className="pdash-action__icon"><History size={18} aria-hidden="true" /></span>
            <span className="pdash-action__text">
              <strong>Redemption History</strong>
              <span>Track request status and payouts</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>
          <Link to="/settings" className="pdash-action">
            <span className="pdash-action__icon"><Settings size={18} aria-hidden="true" /></span>
            <span className="pdash-action__text">
              <strong>Update Profile</strong>
              <span>Edit personal info and security</span>
            </span>
            <ArrowRight size={16} className="pdash-action__arrow" aria-hidden="true" />
          </Link>
        </div>
      </motion.section>
    </section>
  );
}
