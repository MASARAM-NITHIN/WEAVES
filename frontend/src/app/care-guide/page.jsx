'use client';

import React, { Suspense } from 'react';
import CareGuide from '../../views/CareGuide/CareGuide';

export default function CareGuidePage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center text-maroon">Loading Care Guide...</div>}>
      <CareGuide />
    </Suspense>
  );
}
