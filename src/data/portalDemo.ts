export type SurveyStatus = 'draft' | 'live' | 'paused' | 'completed' | 'archived';

export interface PortalSurvey {
  id: string;
  projectId: string;
  projectName: string;
  surveyId: string;
  clientName: string;
  country: string;
  sampleSize: number;
  completes: number;
  cpi: number;
  ir: number;
  loi: number;
  status: SurveyStatus;
  startDate: string;
  endDate: string;
  category: string;
}

export interface PortalDashboardStats {
  activeSurveys: number;
  totalCompletes: number;
  avgIr: number;
  avgLoi: number;
  revenueMtd: number;
  pendingReviews: number;
}

export const PORTAL_DASHBOARD_STATS: PortalDashboardStats = {
  activeSurveys: 12,
  totalCompletes: 18420,
  avgIr: 34,
  avgLoi: 11,
  revenueMtd: 42850,
  pendingReviews: 3,
};

export const PORTAL_SURVEYS: PortalSurvey[] = [
  {
    id: 'srv-001',
    projectId: 'PRJ-2026-0142',
    projectName: 'Global Beverage Preferences Study',
    surveyId: 'SVY-88421',
    clientName: 'Nova Research Group',
    country: 'United States',
    sampleSize: 2500,
    completes: 1842,
    cpi: 4.5,
    ir: 38,
    loi: 12,
    status: 'live',
    startDate: '2026-02-18',
    endDate: '2026-03-28',
    category: 'FMCG',
  },
  {
    id: 'srv-002',
    projectId: 'PRJ-2026-0098',
    projectName: 'Digital Banking Experience Tracker',
    surveyId: 'SVY-77103',
    clientName: 'FinSight Analytics',
    country: 'United Kingdom',
    sampleSize: 1200,
    completes: 956,
    cpi: 6.25,
    ir: 29,
    loi: 15,
    status: 'live',
    startDate: '2026-02-10',
    endDate: '2026-03-15',
    category: 'Financial Services',
  },
  {
    id: 'srv-003',
    projectId: 'PRJ-2026-0201',
    projectName: 'Telehealth Adoption Wave 3',
    surveyId: 'SVY-90214',
    clientName: 'MedPanel Partners',
    country: 'Canada',
    sampleSize: 800,
    completes: 800,
    cpi: 5.75,
    ir: 42,
    loi: 10,
    status: 'completed',
    startDate: '2026-01-05',
    endDate: '2026-02-20',
    category: 'Healthcare',
  },
  {
    id: 'srv-004',
    projectId: 'PRJ-2026-0177',
    projectName: 'EV Purchase Intent Study',
    surveyId: 'SVY-81556',
    clientName: 'AutoPulse Insights',
    country: 'Germany',
    sampleSize: 1500,
    completes: 412,
    cpi: 7.0,
    ir: 22,
    loi: 18,
    status: 'paused',
    startDate: '2026-02-25',
    endDate: '2026-04-10',
    category: 'Automotive',
  },
  {
    id: 'srv-005',
    projectId: 'PRJ-2026-0234',
    projectName: 'Streaming Content Satisfaction',
    surveyId: 'SVY-93887',
    clientName: 'StreamMetrics Co.',
    country: 'Australia',
    sampleSize: 600,
    completes: 0,
    cpi: 3.95,
    ir: 0,
    loi: 8,
    status: 'draft',
    startDate: '2026-03-10',
    endDate: '2026-04-30',
    category: 'Media & Entertainment',
  },
  {
    id: 'srv-006',
    projectId: 'PRJ-2025-0891',
    projectName: 'Retail Loyalty Program Evaluation',
    surveyId: 'SVY-66201',
    clientName: 'ShopWise Research',
    country: 'India',
    sampleSize: 3000,
    completes: 2984,
    cpi: 2.85,
    ir: 45,
    loi: 9,
    status: 'archived',
    startDate: '2025-11-01',
    endDate: '2026-01-15',
    category: 'Retail',
  },
];

export function getSurveyById(id: string): PortalSurvey | undefined {
  return PORTAL_SURVEYS.find((s) => s.id === id);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function statusLabel(status: SurveyStatus): string {
  const labels: Record<SurveyStatus, string> = {
    draft: 'Draft',
    live: 'Live',
    paused: 'Paused',
    completed: 'Completed',
    archived: 'Archived',
  };
  return labels[status];
}
