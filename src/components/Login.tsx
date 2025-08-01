import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import '../styles/main.css';

const CLASS_NAMES = {
  login: 'login',
  loginContainer: 'login-container',
  button: 'login-button',
  logo: 'login-logo',
  title: 'login-title',
  leftPanel: 'login-left-panel',
  rightPanel: 'login-right-panel',
  greeting: 'login-greeting',
  quote: 'login-quote',
  formGroup: 'form-group',
  input: 'login-input',
  formContainer: 'login-form-container',
  divider: 'login-divider'
};

export const Login: React.FC = () => {
  const authService = AuthService.getInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithEmailPassword(email, password);
      if (user) {
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={CLASS_NAMES.login}>
      <div className={CLASS_NAMES.loginContainer}>
        <div className={CLASS_NAMES.leftPanel}>
          <h2 className={CLASS_NAMES.greeting}>Asalamu' Alaykum!</h2>
          <p className={CLASS_NAMES.quote}>
            The prophet ﷺ stated that "Seeking knowledge is an obligation upon every muslim"
            <br />
            <span className="quote-source">(Sunan Ibn Majah 224)</span>
          </p>
        </div>

        <div className={CLASS_NAMES.rightPanel}>
          <img
            src="/logo.webp"
            alt="Tanwir Logo"
            className={CLASS_NAMES.logo}
          />

          <div className={CLASS_NAMES.formContainer}>
            <form onSubmit={handleEmailPasswordLogin}>
              <div className={CLASS_NAMES.formGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  className={CLASS_NAMES.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className={CLASS_NAMES.formGroup}>
                <input
                  type="password"
                  placeholder="Password"
                  className={CLASS_NAMES.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className={CLASS_NAMES.button}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className={CLASS_NAMES.divider}>
              <span>OR</span>
            </div>

            <button
              className={`${CLASS_NAMES.button} google-button`}
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" />
              <span>Sign in with Google</span>
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};
