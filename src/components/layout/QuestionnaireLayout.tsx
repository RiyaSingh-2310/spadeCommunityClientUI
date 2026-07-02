import { Outlet, ScrollRestoration } from 'react-router-dom';
import QuestionnaireHeader from './QuestionnaireHeader';
import QuestionnaireFooter from './QuestionnaireFooter';
import './QuestionnaireLayout.css';

export default function QuestionnaireLayout() {
  return (
    <div className="survey-layout">
      <QuestionnaireHeader />
      <main className="survey-main">
        <Outlet />
      </main>
      <QuestionnaireFooter />
      <ScrollRestoration />
    </div>
  );
}
