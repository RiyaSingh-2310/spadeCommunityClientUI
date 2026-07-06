import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PORTAL_DASHBOARD_STATS,
  PORTAL_SURVEYS,
  formatCurrency,
  formatDate,
  statusLabel,
  type SurveyStatus,
} from '../../data/portalDemo';
import '../../components/portal/portal.css';

export default function PortalDashboard() {
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const stats = PORTAL_DASHBOARD_STATS;

  const filteredSurveys = useMemo(() => {
    return PORTAL_SURVEYS.filter((survey) => {
      const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        survey.projectName.toLowerCase().includes(query) ||
        survey.clientName.toLowerCase().includes(query) ||
        survey.surveyId.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, search]);

  return (
    <div className="portal-page">
      <header className="portal-page__header">
        <h1>Research Dashboard</h1>
        <p>Monitor active fieldwork, quotas, and project performance at a glance.</p>
      </header>

      <div className="portal-kpi-grid">
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Active Surveys</p>
          <p className="portal-kpi-card__value">{stats.activeSurveys}</p>
          <p className="portal-kpi-card__sub">Currently in field</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Total Completes</p>
          <p className="portal-kpi-card__value">{stats.totalCompletes.toLocaleString()}</p>
          <p className="portal-kpi-card__sub">This quarter</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Avg. IR</p>
          <p className="portal-kpi-card__value">{stats.avgIr}%</p>
          <p className="portal-kpi-card__sub">Across live projects</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Avg. LOI</p>
          <p className="portal-kpi-card__value">{stats.avgLoi} min</p>
          <p className="portal-kpi-card__sub">Median length of interview</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Revenue MTD</p>
          <p className="portal-kpi-card__value">{formatCurrency(stats.revenueMtd)}</p>
          <p className="portal-kpi-card__sub">March 2026</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-card__label">Pending Reviews</p>
          <p className="portal-kpi-card__value">{stats.pendingReviews}</p>
          <p className="portal-kpi-card__sub">Awaiting client sign-off</p>
        </div>
      </div>

      <section className="portal-panel">
        <div className="portal-panel__header">
          <h2>Survey Portfolio</h2>
          <div className="portal-filters">
            <input
              type="search"
              placeholder="Search surveys…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search surveys"
            />
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
          {filteredSurveys.length === 0 ? (
            <div className="portal-empty">
              <p>No surveys match your filters.</p>
            </div>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Completes</th>
                  <th>CPI</th>
                  <th>IR</th>
                  <th>LOI</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id}>
                    <td>
                      <Link to={`/portal/surveys/${survey.id}`} className="portal-table__link">
                        {survey.projectName}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>
                        {survey.surveyId}
                      </div>
                    </td>
                    <td>{survey.clientName}</td>
                    <td>{survey.country}</td>
                    <td>
                      <span className={`portal-status portal-status--${survey.status}`}>
                        {statusLabel(survey.status)}
                      </span>
                    </td>
                    <td>
                      {survey.completes.toLocaleString()} / {survey.sampleSize.toLocaleString()}
                    </td>
                    <td>${survey.cpi.toFixed(2)}</td>
                    <td>{survey.ir}%</td>
                    <td>{survey.loi} min</td>
                    <td>{formatDate(survey.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
