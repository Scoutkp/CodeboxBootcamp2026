import { useEffect } from 'react';
import { clearStoredUser, getStoredUser } from '../auth/session';

export default function HomePage() {
  const user = getStoredUser();
  const isLoggedIn = Boolean(user);

  function signOut() {
    clearStoredUser();
    window.location.replace('/login');
  }

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.replace('/login');
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="eyebrow">CodeBox Kitchen</p>
          <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/70 hover:text-white" onClick={signOut}>
            Sign out
          </button>
        </div>
        <h1 className="mt-3 text-5xl font-semibold">Home</h1>
        <p className="mt-4 text-slate-400">Welcome, {user.name}.</p>
      </div>
    </main>
  );
}
