import { Link } from 'react-router-dom';
import { Gift, History, UserRound } from 'lucide-react';
import { usePanelistAuth } from '../../context/PanelistAuthContext';

export default function PanelistDashboardPage() {
  const { user } = usePanelistAuth();

  return (
    <div className="space-y-6">
      <div className="panelist-portal-card-grid">
        <div className="panelist-portal-card">
          <h2>Reward Balance</h2>
          <p>Your current available points</p>
          <div className="panelist-portal-stat">
            {Number(user?.balance_point ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="panelist-portal-card">
          <h2>Account</h2>
          <p>{user?.name}</p>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="panelist-portal-card-grid">
        <Link to="/member/profile" className="panelist-portal-card">
          <UserRound size={22} />
          <h2>Manage Profile</h2>
          <p>Update your name, email, and profile photo.</p>
        </Link>
        <Link to="/member/rewards" className="panelist-portal-card">
          <History size={22} />
          <h2>Reward History</h2>
          <p>Review credits, debits, and redemption activity.</p>
        </Link>
        <Link to="/member/rewards" className="panelist-portal-card">
          <Gift size={22} />
          <h2>Redeem Rewards</h2>
          <p>Submit a redemption request from your balance.</p>
        </Link>
      </div>
    </div>
  );
}
