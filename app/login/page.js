import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="login-page">
      <Link className="nav-btn back-btn" href="/">← На главную</Link>
      <LoginForm />
    </div>
  );
}
