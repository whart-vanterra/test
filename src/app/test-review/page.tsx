'use client';

import React from 'react';
import Link from 'next/link';

export default function TestReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test Review Pages
          </h1>
          <p className="text-xl text-gray-600">
            Use these links to test the review submission flow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Brand/Location Combinations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sample Review URLs</h2>
            <div className="space-y-3">
              <Link
                href="/review/acme-corp/downtown-location"
                className="block p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium">Acme Corp - Downtown</div>
                <div className="text-sm text-gray-600">/review/acme-corp/downtown-location</div>
              </Link>
              
              <Link
                href="/review/tech-startup/main-office"
                className="block p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              >
                <div className="font-medium">Tech Startup - Main Office</div>
                <div className="text-sm text-gray-600">/review/tech-startup/main-office</div>
              </Link>
              
              <Link
                href="/review/restaurant-chain/mall-location"
                className="block p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
              >
                <div className="font-medium">Restaurant Chain - Mall Location</div>
                <div className="text-sm text-gray-600">/review/restaurant-chain/mall-location</div>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-gray-900">1. Create Test Data</h3>
                <p className="text-gray-600">
                  First, create brands and locations in the admin panel to test these URLs.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">2. Test Review Flow</h3>
                <p className="text-gray-600">
                  Click on the sample URLs above to test the complete review submission process.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">3. Test Both Rating Types</h3>
                <p className="text-gray-600">
                  Try both emoji and thumbs rating systems to see different flows.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">4. Test Email Notifications</h3>
                <p className="text-gray-600">
                  Submit negative feedback to test email notification system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
