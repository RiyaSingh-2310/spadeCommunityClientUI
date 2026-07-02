import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import logo from '../../assets/SpadeCommunitylogocompressed.png';
import './QuestionnaireLayout.css';

export default function QuestionnaireHeader() {
  return (
    <header className="survey-header">
      <div className="survey-header__inner">
        <Link to="/" className="survey-header__logo" aria-label="Spade Community Home">
          <img src={logo} alt="Spade Community" className="survey-header__logo-image" />
        </Link>
        <a href="/contact" className="survey-header__help">
          <HelpCircle size={18} aria-hidden="true" />
          <span>Help</span>
        </a>
      </div>
    </header>
  );
}
