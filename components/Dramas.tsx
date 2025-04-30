'use client';
import React from 'react';
import { Heart } from 'lucide-react';

interface Drama {
  name: string;
  author: string;
  publishedDate: string;
  content: string;
}

const dramasData: Drama[] = [
  {
    name: 'Drama 1',
    author: 'Author 1',
    publishedDate: '2023-01-15',
    content: 'This is the content of drama 1.',
  },
  {
    name: 'Drama 2',
    author: 'Author 2',
    publishedDate: '2023-03-20',
    content: 'This is the content of drama 2.',
  },
  {
    name: 'Drama 3',
    author: 'Author 3',
    publishedDate: '2023-05-10',
    content: 'This is the content of drama 3.',
  },
];

export default function Dramas() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Featured Dramas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dramasData.map((drama, index) => (
          <div key={index} className="border p-4 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{drama.name}</h2>
              <button className="text-red-500 hover:text-red-700">
                <Heart />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              By: {drama.author}
            </p>
            <p className="text-gray-500 mb-2">
              Published: {drama.publishedDate}
            </p>
            <p className="text-gray-700">{drama.content}</p>
          </div>
        ))}
      </div>
    </div>
    );
}