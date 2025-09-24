'use client';

import React from 'react';

export default function TestLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Test Login Page
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This is a simple test page to check if the basic setup is working.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>React:</span>
              <span className="text-green-600">✓ Working</span>
            </div>
            <div className="flex justify-between">
              <span>Tailwind:</span>
              <span className="text-green-600">✓ Working</span>
            </div>
            <div className="flex justify-between">
              <span>Next.js:</span>
              <span className="text-green-600">✓ Working</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Real Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
