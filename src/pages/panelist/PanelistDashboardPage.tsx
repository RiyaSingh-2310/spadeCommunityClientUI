import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Coins,
  Gift,
  History,
  Loader2,
  Sparkles,
  UserRound,
  Wallet,
  XCircle,
} from 'lucide-react';
import { ApiError } from '../../api/ApiError';
import AnimatedPoints from '../../components/panelist/AnimatedPoints';
import DashboardEmptyState from '../../components/panelist/DashboardEmptyState';
import DashboardStatCard from '../../components/panelist/DashboardStatCard';
import StatusBadge from '../../components/panelist/StatusBadge';
import Button from '../../components/ui/Button';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import './PanelistExperience.css';

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PanelistDashboardPage() {
  const {
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
    submitRedemption,
  } = usePanelistDashboard();

  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemMethod, setRedeemMethod] = useState('Bank Transfer');
  const [redeemNote, setRedeemNote] = useState('');
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (redemptionMethods.length > 0 && !redemptionMethods.includes(redeemMethod)) {
      setRedeemMethod(redemptionMethods[0]);
    }
  }, [redemptionMethods, redeemMethod]);

  const handleRedeemSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setRedeemMessage('');
    setRedeemError('');

    const points = Number(redeemAmount);
    if (!Number.isFinite(points) || points <= 0) {
      setRedeemError('Enter a valid redemption amount.');
      return;
    }

    if (points > stats.availableBalance) {
      setRedeemError('Redemption amount exceeds your available balance.');
      return;
    }

    const minimum = Number(rewardSettings?.minimum_payout ?? 0);
    if (minimum > 0 && points < minimum) {
      setRedeemError(`Minimum ${minimum.toLocaleString()} points required to redeem.`);
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await submitRedemption({
        reward_points: points,
        remark: redeemMethod,
        comment: redeemNote.trim() || undefined,
      });
      setRedeemMessage(response.message || 'Redemption request submitted successfully.');
      setRedeemAmount('');
      setRedeemNote('');
    } catch (submitError) {
      setRedeemError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Unable to submit redemption request right now.'
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <section className="panelist-dashboard container-wide" aria-live="polite">
      <div className="panelist-dashboard__hero">
        <p className="panelist-dashboard__eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Client Portal
        </p>
        <h1>Welcome back, {user?.name || 'Panelist'}</h1>
        <p>Track your rewards, redeem points, and monitor your research activity.</p>
      </div>

      {error ? (
        <div className="panelist-settings__message panelist-settings__message--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="panelist-dashboard__stats panelist-dashboard__stats--primary">
        <DashboardStatCard
          icon={<Gift size={18} />}
          label="Total Rewards Earned"
          value={stats.totalEarned}
          loading={isLoading}
          accent="violet"
        />
        <DashboardStatCard
          icon={<History size={18} />}
          label="Total Rewards Redeemed"
          value={stats.totalRedeemed}
          loading={isLoading}
          accent="cyan"
        />
        <DashboardStatCard
          icon={<Wallet size={18} />}
          label="Available Reward Balance"
          value={stats.availableBalance}
          loading={isLoading}
          accent="emerald"
        />
      </div>

      <div className="panelist-dashboard__stats panelist-dashboard__stats--secondary">
        <DashboardStatCard
          icon={<ClipboardList size={18} />}
          label="Surveys Completed"
          value={stats.surveysCompleted}
          suffix=""
          loading={isLoading}
          accent="violet"
        />
        <DashboardStatCard
          icon={<Loader2 size={18} />}
          label="Pending Redemptions"
          value={stats.pendingRedemptions}
          suffix=""
          loading={isLoading}
          accent="amber"
        />
        <DashboardStatCard
          icon={<CheckCircle2 size={18} />}
          label="Approved Redemptions"
          value={stats.approvedRedemptions}
          suffix=""
          loading={isLoading}
          accent="emerald"
        />
        <DashboardStatCard
          icon={<XCircle size={18} />}
          label="Rejected Redemptions"
          value={stats.rejectedRedemptions}
          suffix=""
          loading={isLoading}
          accent="amber"
        />
      </div>

      <div className="panelist-dashboard__layout">
        <div className="panelist-dashboard__main">
          <article className="panelist-dashboard__card panelist-dashboard__card--redeem">
            <div className="panelist-dashboard__card-head">
              <h2>
                <Banknote size={18} aria-hidden="true" />
                Redeem Rewards
              </h2>
            </div>
            <div className="panelist-redeem__balance">
              <span>Available Balance</span>
              <AnimatedPoints
                value={stats.availableBalance}
                className="panelist-redeem__balance-value"
              />
            </div>
            <form className="panelist-redeem__form" onSubmit={(event) => void handleRedeemSubmit(event)}>
              <label>
                Redemption Amount
                <input
                  type="number"
                  min="1"
                  value={redeemAmount}
                  onChange={(event) => setRedeemAmount(event.target.value)}
                  placeholder="Enter points to redeem"
                  required
                  disabled={isRedeeming}
                />
              </label>
              <label>
                Redemption Method
                <select
                  value={redeemMethod}
                  onChange={(event) => setRedeemMethod(event.target.value)}
                  disabled={isRedeeming}
                >
                  {redemptionMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Note (optional)
                <input
                  type="text"
                  value={redeemNote}
                  onChange={(event) => setRedeemNote(event.target.value)}
                  placeholder="Additional details for your request"
                  disabled={isRedeeming}
                />
              </label>
              {rewardSettings?.minimum_payout ? (
                <p className="panelist-redeem__hint">
                  Minimum redemption: {Number(rewardSettings.minimum_payout).toLocaleString()} pts
                </p>
              ) : null}
              {redeemError ? (
                <p className="panelist-settings__message panelist-settings__message--error" role="alert">
                  {redeemError}
                </p>
              ) : null}
              {redeemMessage ? (
                <p className="panelist-settings__message panelist-settings__message--success" role="status">
                  {redeemMessage}
                </p>
              ) : null}
              <Button type="submit" variant="gradient" size="md" disabled={isRedeeming}>
                {isRedeeming ? (
                  <>
                    <Loader2 size={16} className="panelist-dashboard__spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Redeem Request'
                )}
              </Button>
            </form>
          </article>

          <article className="panelist-dashboard__card">
            <div className="panelist-dashboard__card-head">
              <h2>
                <History size={18} aria-hidden="true" />
                Redemption History
              </h2>
            </div>
            {isLoading ? (
              <div className="panelist-skeleton panelist-skeleton--table" aria-hidden="true" />
            ) : redemptionHistory.length === 0 ? (
              <DashboardEmptyState
                icon={<Coins size={22} />}
                title="No redemption requests yet"
                description="Submit a redemption request above to see your history here."
              />
            ) : (
              <>
                <div className="panelist-dashboard__table-wrap">
                  <table className="panelist-dashboard__table">
                    <thead>
                      <tr>
                        <th>Request Date</th>
                        <th>Reward Amount</th>
                        <th>Redemption Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redemptionHistory.map((row) => (
                        <tr key={row.id}>
                          <td>{row.requestDate}</td>
                          <td>{row.rewardAmount.toLocaleString()} pts</td>
                          <td>{row.method}</td>
                          <td>
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {redeemTotalPages > 1 ? (
                  <div className="panelist-pagination">
                    <button
                      type="button"
                      disabled={redeemPage <= 1}
                      onClick={() => setRedeemPage((page) => Math.max(1, page - 1))}
                    >
                      Previous
                    </button>
                    <span>
                      Page {redeemPage} of {redeemTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={redeemPage >= redeemTotalPages}
                      onClick={() => setRedeemPage((page) => page + 1)}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </article>

          <article className="panelist-dashboard__card">
            <div className="panelist-dashboard__card-head">
              <h2>
                <ClipboardList size={18} aria-hidden="true" />
                Survey Activity
              </h2>
            </div>
            {isLoading ? (
              <div className="panelist-skeleton panelist-skeleton--table" aria-hidden="true" />
            ) : surveyActivity.length === 0 ? (
              <DashboardEmptyState
                icon={<ClipboardList size={22} />}
                title="No survey activity yet"
                description="Completed surveys and earned rewards will appear here."
              />
            ) : (
              <>
                <div className="panelist-dashboard__table-wrap">
                  <table className="panelist-dashboard__table">
                    <thead>
                      <tr>
                        <th>Survey Name</th>
                        <th>Completion Date</th>
                        <th>Reward Earned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveyActivity.map((row) => (
                        <tr key={row.id}>
                          <td>{row.surveyName}</td>
                          <td>{row.completionDate}</td>
                          <td>{row.rewardEarned.toLocaleString()} pts</td>
                          <td>
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {historyTotalPages > 1 ? (
                  <div className="panelist-pagination">
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
          </article>
        </div>

        <aside className="panelist-dashboard__sidebar">
          <article className="panelist-dashboard__card panelist-profile-card">
            <div className="panelist-profile-card__avatar" aria-hidden="true">
              {user?.profile_image || user?.photo ? (
                <img src={user.profile_image ?? user.photo ?? ''} alt="" />
              ) : (
                <UserRound size={28} />
              )}
            </div>
            <h2>Profile Summary</h2>
            <ul className="panelist-dashboard__kv">
              <li>
                <span>Name</span>
                <strong>{user?.name || '—'}</strong>
              </li>
              <li>
                <span>Email</span>
                <strong>{user?.email || '—'}</strong>
              </li>
              <li>
                <span>Member Since</span>
                <strong>{formatDate(user?.created_at)}</strong>
              </li>
              <li>
                <span>Account Status</span>
                <strong className="panelist-profile-card__status">{user?.status || 'Active'}</strong>
              </li>
            </ul>
            <Link to="/settings" className="panelist-profile-card__edit">
              Edit Profile
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </aside>
      </div>
    </section>
  );
}
