import React from 'react';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Ham Radio Study Site</h1>
      <p className="mb-4">Select a category to browse questions or take an exam.</p>
      <ul>
        <li><a href="/browse/3" className="text-blue-600 underline">Category 3</a></li>
        <li><a href="/browse/2" className="text-blue-600 underline">Category 2</a></li>
        <li><a href="/browse/1" className="text-blue-600 underline">Category 1</a></li>
      </ul>
    </main>
  );
}
