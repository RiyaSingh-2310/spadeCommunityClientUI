import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './PageStyles.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page">
      <div className="page__hero page__hero--compact">
        <div className="container">
          <h1>Login</h1>
          <p>Sign in to your Spade Community account</p>
        </div>
      </div>
      <div className="page__content container">
        <div className="auth-card">
          {submitted ? (
            <div className="auth-card__success">
              <h3>Welcome back!</h3>
              <p>You have been logged in successfully. (Demo mode)</p>
            </div>
          ) : (
            <form className="auth-card__form" onSubmit={handleSubmit}>
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Login
              </Button>
              <div className="auth-card__links">
                <a href="#">Forgot Password</a>
                <Link to="/join">Create Account</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
