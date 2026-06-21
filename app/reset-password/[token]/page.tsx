"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PenLine, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setDone(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <PenLine className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Password reset</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your password has been reset successfully.
          </p>
          <div className="mt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Sign in with new password
            </Link>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">New password</label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
