import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Info, Loader2, Wallet } from 'lucide-react';
import { ApiError } from '../../api/ApiError';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import './PanelistPortal.css';

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

  const minimumPayout = Number(rewardSettings?.minimum_payout ?? 0);

  return (
    <section className="pdash container-wide pdash-fade-in">
      <header className="pdash-page-head">
        <p className="pdash-page-head__eyebrow">
          <Banknote size={13} aria-hidden="true" />
          Redeem Rewards
        </p>
        <h1>Submit redemption request</h1>
        <p>Convert your earned points into rewards through your preferred payout method.</p>
      </header>

      <motion.div
        className="pdash-wallet"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <aside className="pdash-wallet__balance">
          <span>Available balance</span>
          <strong>{stats.availableBalance.toLocaleString()} pts</strong>
          <p>Points ready to redeem from your research participation.</p>
          {minimumPayout > 0 ? (
            <p>
              <Info size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Minimum: {minimumPayout.toLocaleString()} pts
            </p>
          ) : null}
        </aside>

        <article className="pdash-panel pdash-wallet__form">
          <h2>Redemption details</h2>
          <form className="pdash-form" onSubmit={(event) => void handleSubmit(event)}>
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

            {error ? <p className="pdash-message pdash-message--error" role="alert">{error}</p> : null}
            {message ? <p className="pdash-message pdash-message--success" role="status">{message}</p> : null}

            <button type="submit" className="pdash-btn pdash-btn--block" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="pdash-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  Submit Redeem Request
                </>
              )}
            </button>
          </form>
        </article>
      </motion.div>
    </section>
  );
}
