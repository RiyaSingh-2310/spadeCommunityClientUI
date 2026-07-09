import { Coins, History } from 'lucide-react';
import DashboardEmptyState from '../../components/panelist/DashboardEmptyState';
import StatusBadge from '../../components/panelist/StatusBadge';
import { usePanelistDashboard } from '../../hooks/usePanelistDashboard';
import './PanelistExperience.css';

export default function PanelistRedeemHistoryPage() {
  const {
    isLoading,
    redemptionHistory,
    redeemPage,
    redeemTotalPages,
    setRedeemPage,
  } = usePanelistDashboard();

  return (
    <section className="panelist-settings container-wide">
      <div className="panelist-settings__hero">
        <p className="panelist-dashboard__eyebrow">
          <History size={14} aria-hidden="true" />
          Redemption History
        </p>
        <h1>Track Your Redemption Requests</h1>
        <p>View request date, amount, method, and approval status.</p>
      </div>

      <article className="panelist-settings__card">
        {isLoading ? (
          <div className="panelist-skeleton panelist-skeleton--table" aria-hidden="true" />
        ) : redemptionHistory.length === 0 ? (
          <DashboardEmptyState
            icon={<Coins size={22} />}
            title="No redemption requests found"
            description="Your redemption requests will appear here once submitted."
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
    </section>
  );
}
