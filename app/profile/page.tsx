"use client";

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

// Fetches the user profile data from the server and displays it on the page.

export default function Page() {
    const query = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await fetch('/api/profile', {
                method: 'GET',
                cache: 'no-store',
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        },
    });

    if (query.isLoading) return <p>Loading...</p>;
    if (query.isError) return <p>Error: Something went wrong!</p>;
    
    return (
        <div className="min-w-screen flex flex-col justify-center items-center mt-4">
            <h1 className='text-center text-3xl font-bold'>Profile</h1>
            <div className='flex flex-col items-center justify-center mt-6'>
                <Image src={query.data.image} width={100} height={100} style={{ borderRadius: '50%'}} alt={query.data.name} />
                <h2 className='text-2xl font-bold'>{query.data.name}</h2>
                <p className='text-lg'>{query.data.email}</p>
                <p className='text-lg'>{query.data.bio}</p>
                <p className='text-lg'>Role: {query.data.role}</p>
            </div>
        </div>
    )
}
