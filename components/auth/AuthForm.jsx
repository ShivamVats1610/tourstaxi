'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { AlertCircle, ArrowRight, Car, Check, Lock, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFirebaseSession, verifyLegacyLogin } from '@/app/actions/auth';
import { firebaseAuth } from '@/lib/firebase';
import { toast } from 'sonner';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const password = String(form.get('password') || '');
    const adminCode = String(form.get('adminCode') || '').trim();

    startTransition(async () => {
      try {
        const credential = isRegister
          ? await createUserWithEmailAndPassword(firebaseAuth, email, password)
          : await signInOrMigrateLegacyUser(email, password);

        if (isRegister && name) {
          await updateProfile(credential.user, { displayName: name });
        }

        const result = await createFirebaseSession({
          firebaseUid: credential.user.uid,
          email: credential.user.email || email,
          name: name || credential.user.displayName || '',
          phone,
          role: isRegister ? role : undefined,
          adminCode,
        });

        if (!result?.ok) {
          const message = safeAuthMessage(result?.message || 'Unable to start your session.');
          setError(message);
          toast.error('Login failed', { description: message });
          return;
        }

        toast.success(isRegister ? 'Account created' : 'Login successful', {
          description: 'Opening your dashboard now.'
        });
        router.push(result.redirectTo);
        router.refresh();
      } catch (firebaseError) {
        const message = safeAuthMessage(firebaseErrorMessage(firebaseError));
        setError(message);
        toast.error('Authentication failed', { description: message });
      }
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1625037669075-e5472e080265?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85" alt="ToursTaxi cab" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#071527]/90 via-[#12233f]/78 to-[#0f3f3b]/65" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> ToursTaxi dashboard
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {isRegister ? 'Create your travel account.' : 'Welcome back to your journeys.'}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Login to track bookings, view trip details, and manage ToursTaxi requests with the same clean experience as the main website.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Panel icon={ShieldCheck} title="Role based access" text="Customer and admin dashboards stay separate." />
            <Panel icon={Lock} title="Firebase login" text="Secure email and password authentication." />
          </div>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="mb-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#12233f] text-white shadow-lg shadow-slate-950/20">
              <Car className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950">{isRegister ? 'Create account' : 'Login'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isRegister ? 'Register as a customer or authorized admin.' : 'Access your ToursTaxi dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {isRegister && (
              <>
                <Field icon={User} label="Full name">
                  <Input name="name" required placeholder="Customer or admin name" />
                </Field>
                <Field icon={Phone} label="Phone">
                  <Input name="phone" type="tel" placeholder="+91 9XXXXXXXXX" />
                </Field>
              </>
            )}

            <Field icon={Mail} label="Email">
              <Input name="email" type="email" required placeholder="name@example.com" />
            </Field>
            <Field icon={Lock} label="Password">
              <Input name="password" type="password" required placeholder="Minimum 8 characters" />
            </Field>

            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                  {['customer', 'admin'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRole(option)}
                      className={`h-10 rounded text-sm font-semibold capitalize transition ${role === option ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="role" value={role} />
                {role === 'admin' && (
                  <Field icon={ShieldCheck} label="Admin code">
                    <Input name="adminCode" type="password" placeholder="Required for admin registration" />
                  </Field>
                )}
              </>
            )}

            <Button type="submit" disabled={pending} className="mt-2 h-12 bg-amber-400 font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300">
              {pending ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
              {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : 'New to ToursTaxi?'}{' '}
            <Link href={isRegister ? '/login' : '/register'} className="font-semibold text-teal-700 hover:text-teal-800">
              {isRegister ? 'Sign in' : 'Create account'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function firebaseErrorMessage(error) {
  const code = error?.code || '';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Invalid email or password.';
  if (code.includes('operation-not-allowed')) return 'Email/password login is not enabled in Firebase Authentication.';
  if (code.includes('network-request-failed')) return 'Firebase cannot be reached from this browser right now.';
  if (code.includes('unauthorized-domain')) return 'This domain is not allowed in Firebase Authentication settings.';
  if (code.includes('api-key-not-valid')) return 'Firebase API key is not valid for this project.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  return error?.message || 'Authentication failed. Please try again.';
}

function safeAuthMessage(message) {
  const text = String(message || '');
  if (/ssl|openssl|tls|mongodb|mongo|c:\\/i.test(text)) {
    return 'Database connection is temporarily unavailable. Your Firebase account is ready; please try again or open the dashboard.';
  }
  return text || 'Authentication failed. Please try again.';
}

async function signInOrMigrateLegacyUser(email, password) {
  try {
    return await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (error) {
    const code = error?.code || '';
    if (!code.includes('invalid-credential') && !code.includes('user-not-found')) {
      throw error;
    }

    const legacy = await verifyLegacyLogin({ email, password }).catch(() => null);
    if (!legacy?.ok) {
      throw error;
    }

    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (legacy.profile?.name) {
      await updateProfile(credential.user, { displayName: legacy.profile.name });
    }
    return credential;
  }
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 text-teal-600" /> {label}
      </span>
      {children}
    </label>
  );
}

function Panel({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-amber-300" />
      <div className="mt-3 font-bold text-white">{title}</div>
      <div className="mt-1 flex items-start gap-2 text-sm leading-6 text-white/70"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal-200" />{text}</div>
    </div>
  );
}
