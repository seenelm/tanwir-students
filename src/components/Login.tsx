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
  quote: 'login-quote'
};

export const Login: React.FC = () => {
  const authService = AuthService.getInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to sign in. Please try again.');
      setTimeout(() => setError(null), 3000);
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

          <button
            className={CLASS_NAMES.button}
            onClick={handleLogin}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" />
            <span>Sign in with Google</span>
          </button>

          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};
