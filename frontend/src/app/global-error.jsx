'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service securely
    console.error('Next.js Global UI Error Boundary caught an error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light font-montserrat">
          <div className="card shadow-sm border-0 p-5 text-center" style={{ maxWidth: '500px', borderRadius: '1rem' }}>
            <h2 className="text-maroon fw-bold mb-3">Critical Application Error</h2>
            <p className="text-muted mb-4 font-poppins">
              A serious error occurred that prevented the page from loading. Our team has been notified.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button
                onClick={() => reset()}
                className="btn btn-gold text-white px-4 py-2 rounded-pill fw-semibold shadow-sm"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
