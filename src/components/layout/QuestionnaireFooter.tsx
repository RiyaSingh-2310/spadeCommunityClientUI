import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import './QuestionnaireLayout.css';

export default function QuestionnaireFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="survey-footer">
      <div className="survey-footer__inner">
        <Logo className="survey-footer__logo" />
        <p className="survey-footer__copyright">
          &copy; 2000 - {year} SpadeCommunity&reg; All Rights Reserved
        </p>
        <div className="survey-footer__links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span aria-hidden="true">|</span>
          <Link to="/privacy-policy">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
