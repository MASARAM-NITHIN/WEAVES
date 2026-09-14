'use client';

import React, { Suspense } from 'react';
import Sarees from '../../views/Sarees/Sarees';

export default function SareesPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center text-maroon">Loading Sarees...</div>}>
      <Sarees />
    </Suspense>
  );
}
