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
      <header className="pdash-page-head">
        <p className="pdash-page-head__eyebrow">
          <History size={13} aria-hidden="true" />
          Redemption History
        </p>
        <h1>Track your redemption requests</h1>
        <p>View request date, amount, method, and approval status for every payout.</p>
      </header>

      <motion.article
        className="pdash-panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="pdash-panel__head">
          <h2>All requests</h2>
          <p>{redemptionHistory.length > 0 ? `${redemptionHistory.length} request(s) on this page` : 'Your payout history'}</p>
        </div>

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
