'use client';
import React from 'react';
import Poems from '../components/Poems';  
import Stories from '../components/Stories';
import Dramas from '../components/Dramas';

export default function Home() {
  return (
    <>
      <Poems />
      <Stories />
      <Dramas />
    </>
  );
}
