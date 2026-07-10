import { motion } from 'framer-motion';
import { Coins, History } from 'lucide-react';
import StatusBadge from '../../components/panelist/StatusBadge';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import './PanelistPortal.css';

export default function PanelistRedeemHistoryPage() {
  const {
    isLoading,
    redemptionHistory,
    redeemPage,
    redeemTotalPages,
    setRedeemPage,
  } = usePanelistDashboard();

  return (
    <section className="pdash container-wide pdash-fade-in">
      <motion.header
        className="pdash-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="pdash-hero__inner">
          <div className="pdash-hero__copy">
            <p className="pdash-hero__eyebrow">
              <History size={13} aria-hidden="true" />
              Redemption History
            </p>
            <h1 className="pdash-hero__title">Track Your Redemption Requests</h1>
            <p className="pdash-hero__subtitle">
              View request date, amount, method, and approval status for every payout.
            </p>
          </div>
          <div className="pdash-hero__avatar" aria-hidden="true">
            <Coins size={22} />
          </div>
        </div>
      </motion.header>

      <motion.article
        className="pdash-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
      >
        {isLoading ? (
          <div className="pdash-skeleton pdash-skeleton--table" aria-hidden="true" />
        ) : redemptionHistory.length === 0 ? (
          <div className="pdash-empty">
            <div className="pdash-empty__icon">
              <Coins size={20} aria-hidden="true" />
            </div>
            <p className="pdash-empty__title">No redemption requests found</p>
            <p className="pdash-empty__desc">Your redemption requests will appear here once submitted.</p>
          </div>
        ) : (
          <>
            <div className="pdash-table-wrap">
              <table className="pdash-table">
                <thead>
                  <tr>
                    <th>Request Date</th>
                    <th>Reward Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionHistory.map((row) => (
                    <tr key={row.id}>
                      <td>{row.requestDate}</td>
                      <td className="pdash-table__reward">{row.rewardAmount.toLocaleString()} pts</td>
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
              <div className="pdash-pagination">
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
      </motion.article>
    </section>
  );
}
