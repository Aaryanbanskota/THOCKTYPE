'use client';

import React from 'react';
import { TypingTest } from '@/components/TypingTest';

export default function TestPage() {
  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-4xl">
        <TypingTest />
      </div>
    </div>
  );
}
