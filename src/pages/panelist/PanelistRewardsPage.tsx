import { useEffect, useState, type FormEvent } from 'react';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import {
  createRedeemRequest,
  getMyProfile,
  getMyRedeemRequests,
  getMyRewardHistory,
  getRewardSettings,
  type RedeemRequestItem,
  type RewardHistoryItem,
  type RewardSettings,
} from '../../api/panelist';
import { ApiError } from '../../api/ApiError';
import Button from '../../components/ui/Button';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function PanelistRewardsPage() {
  const { user, updateUser } = usePanelistAuth();
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [requests, setRequests] = useState<RedeemRequestItem[]>([]);
  const [settings, setSettings] = useState<RewardSettings | null>(null);
  const [rewardPoints, setRewardPoints] = useState('');
  const [remark, setRemark] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const [profile, historyResponse, requestsResponse, settingsResponse] = await Promise.all([
      getMyProfile(),
      getMyRewardHistory(),
      getMyRedeemRequests(),
      getRewardSettings(),
    ]);
    updateUser(profile);
    setHistory(historyResponse.data ?? []);
    setRequests(requestsResponse.data ?? []);
    setSettings(settingsResponse);
  };

  useEffect(() => {
    void loadData().catch(() => {
      setError('Unable to load reward information right now.');
    });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await createRedeemRequest({
        reward_points: Number(rewardPoints),
        remark: remark.trim() || undefined,
      });
      setMessage(response.message || 'Redemption request submitted successfully.');
      setRewardPoints('');
      setRemark('');
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Unable to submit redemption request right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panelist-portal-card-grid">
        <div className="panelist-portal-card">
          <h2>Current Balance</h2>
          <div className="panelist-portal-stat">
            {Number(user?.balance_point ?? 0).toLocaleString()} pts
          </div>
        </div>
        <div className="panelist-portal-card">
          <h2>Minimum Redemption</h2>
          <div className="panelist-portal-stat">
            {Number(settings?.minimum_payout ?? 0).toLocaleString()} pts
          </div>
        </div>
      </div>

      <div className="panelist-portal-panel">
        <h2>Submit Redemption Request</h2>
        <p>Request a payout from your available reward balance.</p>

        {message ? <div className="panelist-portal-message panelist-portal-message--success">{message}</div> : null}
        {error ? <div className="panelist-portal-message panelist-portal-message--error">{error}</div> : null}

        <form className="panelist-portal-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Points to redeem
            <input
              type="number"
              min="1"
              value={rewardPoints}
              onChange={(event) => setRewardPoints(event.target.value)}
              required
            />
          </label>

          <label>
            Remark (optional)
            <textarea
              rows={3}
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
            />
          </label>

          <div className="panelist-portal-actions">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit request'}
            </Button>
          </div>
        </form>
      </div>

      <div className="panelist-portal-panel">
        <h2>Reward History</h2>
        <div className="panelist-portal-table-wrap">
          <table className="panelist-portal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4}>No reward history found.</td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.transaction_type}</td>
                    <td>{item.reward_points}</td>
                    <td>{item.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panelist-portal-panel">
        <h2>Redemption Requests</h2>
        <div className="panelist-portal-table-wrap">
          <table className="panelist-portal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Points</th>
                <th>Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4}>No redemption requests yet.</td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.created_at)}</td>
                    <td>{item.reward_points}</td>
                    <td>{item.status}</td>
                    <td>{item.remark || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
