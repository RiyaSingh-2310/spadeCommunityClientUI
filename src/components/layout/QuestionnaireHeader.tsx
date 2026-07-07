import { HelpCircle } from 'lucide-react';
import Logo from '../ui/Logo';
import './QuestionnaireLayout.css';

export default function QuestionnaireHeader() {
  return (
    <header className="survey-header">
      <div className="survey-header__inner">
        <Logo className="survey-header__logo" variant="dark" size="sm" />
        <a href="/contact" className="survey-header__help">
          <HelpCircle size={18} aria-hidden="true" />
          <span>Help</span>
        </a>
      </div>
    </header>
  );
}
