'use client';

import React from 'react';
import { TypingTest } from '@/components/TypingTest';

export default function TestPage() {
  return (
    <div className="w-full max-w-full flex-1 flex flex-col justify-center items-center px-2 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
      <div className="w-full max-w-4xl">
        <TypingTest />
      </div>
    </div>
  );
}
