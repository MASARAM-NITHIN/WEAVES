'use client';

import React, { Suspense } from 'react';
import Collections from '../../views/Collections/Collections';

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center text-maroon">Loading Collections...</div>}>
      <Collections />
    </Suspense>
  );
}
