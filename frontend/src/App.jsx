import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';

export default function App() {
  const isHome = window.location.pathname === '/home';
  const isLoggedIn = sessionStorage.getItem('user');

  if (isHome && !isLoggedIn) {
    window.location.replace('/login');
    return null;
  }

  return isHome ? <HomePage /> : <LoginPage />;
}
