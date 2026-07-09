import { useState, type FormEvent } from 'react';
import { Banknote, Loader2 } from 'lucide-react';
import { ApiError } from '../../api/ApiError';
import Button from '../../components/ui/Button';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import './PanelistExperience.css';

export default function PanelistRedeemPage() {
  const { stats, rewardSettings, redemptionMethods, submitRedemption } = usePanelistDashboard();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(redemptionMethods[0] || 'Bank Transfer');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const points = Number(amount);
    if (!Number.isFinite(points) || points <= 0) {
      setError('Please enter a valid reward amount.');
      return;
    }

    if (points > stats.availableBalance) {
      setError('Redemption amount exceeds available balance.');
      return;
    }

    const minimum = Number(rewardSettings?.minimum_payout ?? 0);
    if (minimum > 0 && points < minimum) {
      setError(`Minimum ${minimum.toLocaleString()} points required to redeem.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitRedemption({
        reward_points: points,
        remark: method,
        comment: note.trim() || undefined,
      });
      setMessage(response.message || 'Redeem request submitted successfully.');
      setAmount('');
      setNote('');
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to submit request right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panelist-settings container-wide">
      <div className="panelist-settings__hero">
        <p className="panelist-dashboard__eyebrow">
          <Banknote size={14} aria-hidden="true" />
          Redeem Rewards
        </p>
        <h1>Submit Redemption Request</h1>
        <p>Use your available balance to request a payout.</p>
      </div>

      <article className="panelist-settings__card">
        <p className="panelist-redeem__hint">
          Available Balance: <strong>{stats.availableBalance.toLocaleString()} pts</strong>
        </p>
        <form className="panelist-redeem__form" onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Redemption Amount
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter points to redeem"
            />
          </label>

          <label>
            Redemption Method
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              disabled={isSubmitting}
            >
              {redemptionMethods.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Note (optional)
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={isSubmitting}
              placeholder="Any additional details"
            />
          </label>

          {rewardSettings?.minimum_payout ? (
            <p className="panelist-redeem__hint">
              Minimum redemption: {Number(rewardSettings.minimum_payout).toLocaleString()} points
            </p>
          ) : null}

          {error ? <p className="panelist-settings__message panelist-settings__message--error">{error}</p> : null}
          {message ? <p className="panelist-settings__message panelist-settings__message--success">{message}</p> : null}

          <Button type="submit" variant="gradient" size="md" disabled={isSubmitting}>
            {isSubmitting ? (
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
    </section>
  );
}
