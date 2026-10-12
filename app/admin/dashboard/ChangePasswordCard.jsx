'use client';

import { useState, useTransition } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { KeyRound, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { firebaseAuth } from '@/lib/firebase';

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, startTransition] = useTransition();

  function submit(event) {
    event.preventDefault();

    startTransition(async () => {
      try {
        const user = firebaseAuth.currentUser;
        if (!user?.email) {
          throw new Error('Please login again before changing password.');
        }
        if (newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New password and confirm password do not match.');
        }
        if (currentPassword === newPassword) {
          throw new Error('New password must be different from current password.');
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password changed', { description: 'Use the new password from your next login.' });
      } catch (error) {
        toast.error('Password not changed', { description: passwordErrorMessage(error) });
      }
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white"><KeyRound className="h-4 w-4" /></span>
        <div>
          <h2 className="font-black">Change Password</h2>
          <p className="text-sm font-medium text-slate-600">Update the current admin login password.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-3">
        <Field label="Current Password">
          <Input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" autoComplete="current-password" required placeholder="Current password" />
        </Field>
        <Field label="New Password">
          <Input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" autoComplete="new-password" required minLength={8} placeholder="Minimum 8 characters" />
        </Field>
        <Field label="Confirm Password">
          <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat new password" />
        </Field>
        <Button type="submit" disabled={pending} className="h-10 rounded-md bg-teal-700 text-xs font-black text-white hover:bg-teal-800 md:col-span-3 md:w-fit">
          <Lock className="h-4 w-4" /> {pending ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="min-w-0 text-xs font-bold uppercase tracking-wider text-slate-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function passwordErrorMessage(error) {
  const code = error?.code || '';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Current password is not correct.';
  if (code.includes('weak-password')) return 'New password is too weak.';
  if (code.includes('requires-recent-login')) return 'Please logout, login again, then change password.';
  if (code.includes('network-request-failed')) return 'Network error. Please try again.';
  return error?.message || 'Unable to change password.';
}
