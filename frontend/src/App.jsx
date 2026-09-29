import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import { getStoredUser } from './auth/session';

export default function App() {
  const isHome = window.location.pathname === '/home';
  const isLoggedIn = Boolean(getStoredUser());

  if (isHome && !isLoggedIn) {
    window.location.replace('/login');
    return null;
  }

  return isHome ? <HomePage /> : <LoginPage />;
}
