import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PORTAL_SURVEYS,
  statusLabel,
  type SurveyStatus,
} from '../../data/portalDemo';
import '../../components/portal/portal.css';

export default function PortalSurveys() {
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return PORTAL_SURVEYS;
    return PORTAL_SURVEYS.filter((s) => s.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <h1>Survey Management</h1>
        <p>View, filter, and manage all research surveys across your portfolio.</p>
      </header>

      <section className="portal-panel">
        <div className="portal-panel__header">
          <h2>All Surveys ({filtered.length})</h2>
          <div className="portal-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SurveyStatus | 'all')}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Survey ID</th>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Sample</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((survey) => (
                <tr key={survey.id}>
                  <td>{survey.surveyId}</td>
                  <td>{survey.projectName}</td>
                  <td>{survey.clientName}</td>
                  <td>
                    <span className={`portal-status portal-status--${survey.status}`}>
                      {statusLabel(survey.status)}
                    </span>
                  </td>
                  <td>{survey.sampleSize.toLocaleString()}</td>
                  <td>
                    <Link to={`/portal/surveys/${survey.id}`} className="portal-table__link">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
