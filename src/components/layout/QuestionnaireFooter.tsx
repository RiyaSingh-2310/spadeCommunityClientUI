import { Link } from 'react-router-dom';
import logo from '../../assets/SpadeCommunitylogocompressed.png';
import './QuestionnaireLayout.css';

export default function QuestionnaireFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="survey-footer">
      <div className="survey-footer__inner">
        <Link to="/" className="survey-footer__logo" aria-label="Spade Community Home">
          <img src={logo} alt="Spade Community" className="survey-footer__logo-image" />
        </Link>
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
