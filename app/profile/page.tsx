"use client";

import Link from 'next/link';
import { useProfile } from '@/hooks/use-profile';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';

export default function Page() {
    const query = useProfile();

    if (query.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (query.isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-destructive">Error: {(query.error as Error)?.message || 'Failed to load profile'}</p>
        </div>
      );
    }

    const user = query.data!;

    return (
        <div className="flex flex-col items-center mt-8">
            <h1 className='text-3xl font-bold'>Profile</h1>
            <div className='flex flex-col items-center mt-8 gap-3'>
                <Avatar src={user.image} name={user.name} size="lg" />
                <h2 className='text-2xl font-bold'>{user.name}</h2>
                <p className='text-muted-foreground'>{user.email}</p>
                {user.bio && <p className='text-muted-foreground max-w-md text-center'>{user.bio}</p>}
                {user.username && <p className='text-sm text-muted-foreground'>@{user.username}</p>}
                <p className='text-sm text-muted-foreground capitalize'>Role: {user.role}</p>
            </div>
            <Link href="/profile/update">
                <Button variant="outline" className="mt-6">Update Profile</Button>
            </Link>
        </div>
    )
}
