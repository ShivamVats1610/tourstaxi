import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: 'Login | ToursTaxi', robots: { index: false, follow: false } };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
