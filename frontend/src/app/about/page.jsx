'use client';

import React, { Suspense } from 'react';
import About from '../../views/About/About';

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center text-maroon">Loading About Us...</div>}>
      <About />
    </Suspense>
  );
}
