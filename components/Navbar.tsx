'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Menu, X, Home, BookOpen, PenSquare, Sparkles, Drama, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import NotificationBell from '@/components/NotificationBell';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/content', label: 'Contents', icon: BookOpen },
  { href: '/books', label: 'Books', icon: BookOpen },
  { href: '/dramas', label: 'Dramas', icon: Drama },
  { href: '/content/write', label: 'Write', icon: PenSquare },
  { href: '/content/generate', label: 'Generate', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3">
        {/* Hamburger (all screen sizes) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand — centered */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="font-display font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            Rachna Kranti
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
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
      </header>

      {/* Drawer overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="fixed top-14 left-0 bottom-0 z-40 w-64 bg-background border-r border-border animate-in slide-in-from-left-2 p-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t pt-3 mt-3">
              {status === 'authenticated' ? (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => { setMenuOpen(false); signIn(); }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
