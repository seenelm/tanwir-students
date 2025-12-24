import React, { useState } from 'react';
import {
  useSignInWithGoogle,
  useSignInWithEmailPassword,
} from '../queries/authQueries';
import '../styles/main.css';

export const Login: React.FC = () => {
  const googleLogin = useSignInWithGoogle();
  const emailLogin = useSignInWithEmailPassword();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loading = googleLogin.isPending || emailLogin.isPending;
  const error =
    (googleLogin.error as Error)?.message ||
    (emailLogin.error as Error)?.message ||
    null;

  const handleGoogleLogin = () => {
    googleLogin.mutate();
  };

  const handleEmailPasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    emailLogin.mutate({ email, password });
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-left-panel">
          <h2 className="login-greeting">Asalamu' Alaykum!</h2>
          <p className="login-quote">
            The Prophet ﷺ said:
            <br />
            <em>“Seeking knowledge is an obligation upon every Muslim”</em>
          </p>
        </div>

        <div className="login-right-panel">
          <img src="/logo.webp" alt="Tanwir Logo" className="login-logo" />

          <form onSubmit={handleEmailPasswordLogin}>
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button className="login-button" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="login-divider">OR</div>

          <button
            className="login-button google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
          >
            Sign in with Google
          </button>

          {error && <div className="login-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};
