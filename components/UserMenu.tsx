'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar } from '@/components/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar src={user.image} name={user.name} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="w-4 h-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile/update')}>
          <Settings className="w-4 h-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
