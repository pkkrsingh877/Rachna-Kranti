'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Menu, X, Home, BookOpen, PenSquare, Drama, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import NotificationBell from '@/components/NotificationBell';

const navLinks = [
  { href: '/content', label: 'Contents', icon: BookOpen },
  { href: '/books', label: 'Books', icon: BookOpen },
  { href: '/dramas', label: 'Dramas', icon: Drama },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.05]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 gap-3"
        style={{
          backgroundColor: useTransform(bgOpacity, (v) =>
            `oklch(from var(--background) l c h / ${v < 0.05 ? 0 : v * 0.85})`
          ),
          borderColor: useTransform(borderOpacity, (v) =>
            `oklch(from var(--border) l c h / ${v})`
          ),
          boxShadow: useTransform(shadowOpacity, (v) =>
            v > 0.01 ? `0 1px 3px oklch(0 0 0 / ${v})` : 'none'
          ),
          backdropFilter: useTransform(bgOpacity, (v) =>
            v < 0.05 ? 'none' : 'blur(12px)'
          ),
        }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary/50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 mr-auto">
          <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white leading-none">
            RK
          </span>
          <motion.span
            className="hidden sm:inline font-display font-semibold text-base tracking-tight"
            style={{ opacity: useTransform(scrollY, [0, 80], [0, 1]) }}
          >
            Rachna Kranti
          </motion.span>
          <motion.span
            className="sm:hidden font-display font-semibold text-sm tracking-tight"
            style={{ opacity: useTransform(scrollY, [0, 80], [0, 1]) }}
          >
            Rachna Kranti
          </motion.span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary/60 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/content/write">
            <Button variant="default" size="sm" className="hidden sm:inline-flex">
              <PenSquare className="w-3.5 h-3.5" />
              Write
            </Button>
          </Link>
          {status === 'authenticated' && session.user ? (
            <>
              <NotificationBell />
              <UserMenu user={session.user} />
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </motion.header>

      <div style={{ height: '3.5rem' }} />

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-14 left-0 bottom-0 z-40 w-64 bg-background border-r border-border p-3 space-y-1 overflow-y-auto"
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/' ? 'bg-secondary/60 text-foreground' : 'text-foreground hover:bg-secondary/30'
              )}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-secondary/60 text-foreground' : 'text-foreground hover:bg-secondary/30'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/content/write"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              Write
            </Link>
            <div className="border-t border-border pt-3 mt-3 space-y-1">
              {status !== 'authenticated' ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => { setMenuOpen(false); signIn(); }}
                >
                  Sign In
                </Button>
              ) : (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
}
