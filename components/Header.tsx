'use client';
import React from 'react';
import Link from 'next/link';
import logoLight from '@/public/logo-light.png';
import { Menu } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleSignOut = async () => {
        await signOut();
    }

    const handleSignIn = async () => {
        await signIn();
    }

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <header className="drop-shadow-xl bg-white">
            <nav className="flex flex-row flex-wrap justify-around items-center py-2">
                {/* App Icon */}
                <div className="flex items-center">
                    <Link href="/">
                        <img src={logoLight.src} alt="Logo" className="h-10" />
                    </Link>
                </div>
                {/* Hamburger Icon */}
                <Menu className='block md:hidden' onClick={toggleMenu} />

                {/* Desktop/Tablet Menu */}
                {/* Desktop/Tablet Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/" className="text-gray-700 hover:text-blue-500">Home</Link>
                    <Link href="/content" className="text-gray-700 hover:text-blue-500">Contents</Link>
                    <Link href="/content/generate" className="text-gray-700 hover:text-blue-500">Create</Link>
                    <Link href="/profile" className="text-gray-700 hover:text-blue-500">Profile</Link>
                    {session ? (
                        <>
                            <button onClick={handleSignOut} className="bg-white-900 text-black border-2  px-4 py-2 rounded-lg">
                                Sign Out</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleSignIn} className="bg-white-900 text-black border-2  px-4 py-2 rounded-lg">
                                Sign In</button>
                        </>
                    )}
                </div>
            </nav>
            {/* Sidebar */}
            {/* Mobile Menu */}
            <aside className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} flex flex-col items-center justify-center`}>
                <hr className='m-4 w-full bg-black-100' />
                <Link href="/" className="block py-2 px-4 text-gray-700">Home</Link>
                <Link href="/content" className="block py-2 px-4 text-gray-700">Contents</Link>
                <Link href="/content/generate" className="block py-2 px-4 text-gray-700">Create</Link>
                <Link href="/profile" className="block py-2 px-4 text-gray-700">Profile</Link>
                {session ? (
                    <>
                        <button onClick={handleSignOut} className="bg-white-900 text-black border-2  px-4 py-2 rounded-lg">
                            Sign Out</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleSignIn} className="bg-white-900 text-black border-2  px-4 py-2 rounded-lg">
                            Sign In</button>
                    </>
                )}
            </aside>
        </header>

    );
}
