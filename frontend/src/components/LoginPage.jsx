import { useEffect, useRef, useState } from 'react';
import { getStoredUser, storeUser } from '../auth/session';
import { apiFetch } from '../api/client';

const initialForm = { username: '', password: '', passwordConfirmation: '' };

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleButtonRef = useRef(null);
  const isLoggedIn = Boolean(getStoredUser());

  useEffect(() => {
    if (isLoggedIn) {
      window.location.replace('/home');
    }
  }, [isLoggedIn]);

  if (isLoggedIn) return null;

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await apiFetch(isLogin ? '/api/login' : '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      storeUser(result.user, result.token); window.location.href = '/home';
    } catch { setError('Could not connect to the server.'); }
    finally { setLoading(false); }
  }

  function toggleMode() { setMode(isLogin ? 'register' : 'login'); setForm(initialForm); setError(''); }

  useEffect(() => {
    if (!googleClientId) return undefined;
    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return false;
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleCredential });
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large', width: 360 });
      return true;
    };
    if (initializeGoogle()) return undefined;
    const timer = window.setInterval(() => { if (initializeGoogle()) window.clearInterval(timer); }, 100);
    return () => window.clearInterval(timer);
  }, [googleClientId]);

  async function handleGoogleCredential({ credential }) {
    setError(''); setLoading(true);
    try {
      const response = await apiFetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      storeUser(result.user, result.token); window.location.href = '/home';
    } catch { setError('Could not connect to the server.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="login-page flex min-h-screen items-center justify-center px-6 py-12">
      <section className="login-card w-full max-w-md p-8 sm:p-10">
        <p className="eyebrow">CodeBox Kitchen</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome back.</h1>
        <p className="mt-3 text-slate-400">{isLogin ? 'Sign in to continue to your recipe journal.' : 'Create an account to start saving recipes.'}</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <input className="field" name="username" placeholder="Username" value={form.username} onChange={updateField} required />
          <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={updateField} required />
          {!isLogin && <input className="field" name="passwordConfirmation" type="password" placeholder="Confirm password" value={form.passwordConfirmation} onChange={updateField} required />}
          {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="primary-button" disabled={loading}>{loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
        {googleClientId ? <div ref={googleButtonRef} className="flex justify-center" /> : <p className="text-sm text-rose-300">Google sign-in is not configured.</p>}
        <button className="mt-6 text-sm text-slate-400 hover:text-white" onClick={toggleMode}>{isLogin ? 'Need an account? Create one' : 'Already have an account? Log in'}</button>
      </section>
    </main>
  );
}
