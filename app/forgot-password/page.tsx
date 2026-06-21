"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PenLine, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <PenLine className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            If an account exists for {email}, we&apos;ve sent a password reset link.
          </p>
          <div className="mt-6 space-y-3">
            <button onClick={() => setSent(false)} className="text-sm text-brand-600 hover:underline font-medium block">
              Try again
            </button>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
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
            <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-brand-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
}
