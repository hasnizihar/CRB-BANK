'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Something went wrong!</h1>
              <p className="text-slate-500 text-sm">
                An unexpected error has occurred in the application. We've been notified and are looking into it.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-left overflow-hidden">
              <p className="text-xs font-mono text-slate-600 truncate">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 justify-center pt-4">
              <button
                onClick={() => reset()}
                className="px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
              >
                Try again
              </button>
              <Link 
                href="/dashboard"
                className="px-6 py-2.5 rounded-lg bg-white text-slate-700 font-medium text-sm border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
