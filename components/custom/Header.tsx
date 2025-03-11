'use client';
import React from 'react';
import Link from 'next/link';
import logoLight from '@/public/logo-light.png';
import { Menu } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/" className="text-gray-700 hover:text-blue-500">Home</Link>
                    <Link href="/poems" className="text-gray-700 hover:text-blue-500">Poems</Link>
                    <Link href="/stories" className="text-gray-700 hover:text-blue-500">Stories</Link>
                    <Link href="/dramas" className="text-gray-700 hover:text-blue-500">Dramas</Link>
                </div>
            </nav>
            {/* Sidebar */}
            {/* Mobile Menu */}
            <aside className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} flex flex-col items-center justify-center`}>
                <hr className='m-4 w-full bg-black-100' />
                <Link href="/" className="block py-2 px-4 text-gray-700">Home</Link>
                <Link href="/poems" className="block py-2 px-4 text-gray-700">Poems</Link>
                <Link href="/stories" className="block py-2 px-4 text-gray-700">Stories</Link>
                <Link href="/dramas" className="block py-2 px-4 text-gray-700">Dramas</Link>
            </aside>
        </header>

    );
}
