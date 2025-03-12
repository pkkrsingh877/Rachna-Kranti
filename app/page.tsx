'use client';
import React from 'react';
import Poems from '@/app/components/Poems';  
import Stories from '@/app/components/Stories';
import Dramas from '@/app/components/Dramas';

export default function Home() {
  return (
    <>
      <Poems />
      <Stories />
      <Dramas />
    </>
  );
}
