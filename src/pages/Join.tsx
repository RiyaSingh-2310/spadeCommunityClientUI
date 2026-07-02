import JoinForm from '../components/ui/JoinForm';
import './PageStyles.css';

export default function Join() {
  return (
    <div className="page">
      <div className="page__hero page__hero--join">
        <div className="container">
          <h1>Join For Free</h1>
          <p>Sign up today and get a $2 bonus</p>
        </div>
      </div>
      <div className="page__content container">
        <div className="join-page">
          <JoinForm className="join-page__form" />
        </div>
      </div>
    </div>
  );
}
