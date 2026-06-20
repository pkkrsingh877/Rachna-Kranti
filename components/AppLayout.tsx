'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  PenSquare,
  BookOpen,
  User,
  Home,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/content', label: 'Contents', icon: BookOpen },
  { href: '/books', label: 'Books', icon: BookOpen },
  { href: '/content/write', label: 'Write', icon: PenSquare },
  { href: '/content/generate', label: 'Generate', icon: Sparkles },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isAuthPage = pathname.startsWith('/api/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop always visible, mobile overlay */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <PenSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-sidebar-foreground">
                Rachna Kranti
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-sidebar-accent md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer — user info */}
          <div className="p-3 border-t border-sidebar-border">
            {status === 'authenticated' && session.user ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {session.user.email}
                  </p>
                </div>
                <div className="md:hidden">
                  <NotificationBell />
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop breadcrumb-style label */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            {navItems
              .filter((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
              .map((item) => (
                <span key={item.href} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              ))}
            {!navItems.some((item) => pathname === item.href || pathname.startsWith(item.href + '/')) && (
              <span>Pages</span>
            )}
          </div>

          <div className="flex-1" />

          {/* Desktop quick-actions */}
          {status === 'authenticated' ? (
            <div className="hidden md:flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/content/write"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                Write
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
