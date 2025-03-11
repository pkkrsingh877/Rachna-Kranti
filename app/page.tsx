'use client';
import React from 'react';
import Header from '@/components/custom/Header';
export default function Home() {
  return (
    <div className="flex flex-col">
      <Header/>
      <main>
        {/* Content goes here */}
      </main>
      <footer>
        {/* Footer content goes here */}
      </footer>
    </div>
  );
}
