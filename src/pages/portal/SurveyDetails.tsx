import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  formatDate,
  getSurveyById,
  statusLabel,
} from '../../data/portalDemo';
import '../../components/portal/portal.css';

export default function SurveyDetails() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = surveyId ? getSurveyById(surveyId) : undefined;

  if (!survey) {
    return (
      <div className="portal-page">
        <Link to="/portal/surveys" className="portal-back-link">
          <ArrowLeft size={16} />
          Back to surveys
        </Link>
        <div className="portal-empty">
          <h2>Survey not found</h2>
          <p>The survey you are looking for does not exist in the demo data.</p>
        </div>
      </div>
    );
  }

  const fillRate = Math.round((survey.completes / survey.sampleSize) * 100);

  return (
    <div className="portal-page">
      <Link to="/portal/surveys" className="portal-back-link">
        <ArrowLeft size={16} />
        Back to surveys
      </Link>

      <header className="portal-page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1>{survey.projectName}</h1>
          <span className={`portal-status portal-status--${survey.status}`}>
            {statusLabel(survey.status)}
          </span>
        </div>
        <p>
          {survey.clientName} · {survey.country} · {survey.category}
        </p>
      </header>

      <div className="portal-detail-grid">
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Sample Size</p>
          <p className="portal-detail-card__value">{survey.sampleSize.toLocaleString()}</p>
        </div>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">CPI</p>
          <p className="portal-detail-card__value">${survey.cpi.toFixed(2)}</p>
        </div>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Incidence Rate (IR)</p>
          <p className="portal-detail-card__value">{survey.ir}%</p>
        </div>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Length of Interview</p>
          <p className="portal-detail-card__value">{survey.loi} min</p>
        </div>
      </div>

      <div className="portal-detail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Completes</p>
          <p className="portal-detail-card__value">{survey.completes.toLocaleString()}</p>
        </div>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Fill Rate</p>
          <p className="portal-detail-card__value">{fillRate}%</p>
        </div>
        <div className="portal-detail-card">
          <p className="portal-detail-card__label">Remaining Quota</p>
          <p className="portal-detail-card__value">
            {(survey.sampleSize - survey.completes).toLocaleString()}
          </p>
        </div>
      </div>

      <section className="portal-panel" style={{ marginTop: 24 }}>
        <div className="portal-panel__header">
          <h2>Project Details</h2>
        </div>
        <div style={{ padding: '8px 24px 24px' }}>
          <dl className="portal-detail-meta">
            <div className="portal-meta-row">
              <dt>Project Name</dt>
              <dd>{survey.projectName}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Project ID</dt>
              <dd>{survey.projectId}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Survey ID</dt>
              <dd>{survey.surveyId}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Client Name</dt>
              <dd>{survey.clientName}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Country</dt>
              <dd>{survey.country}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Survey Status</dt>
              <dd>{statusLabel(survey.status)}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>Start Date</dt>
              <dd>{formatDate(survey.startDate)}</dd>
            </div>
            <div className="portal-meta-row">
              <dt>End Date</dt>
              <dd>{formatDate(survey.endDate)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
