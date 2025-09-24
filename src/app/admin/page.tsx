'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { OptimizedOverview } from '@/components/OptimizedOverview';
import { DashboardStats } from '@/lib/types';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/overview/stats');
      const result = await response.json();

      if (response.ok) {
        setStats(result.data.stats);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'brands', label: 'Brands' },
    { id: 'locations', label: 'Locations' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'platforms', label: 'Platforms' },
    { id: 'users', label: 'Users' },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the admin dashboard.</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your review system from the admin dashboard below.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center min-h-96">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              ) : stats ? (
                <OptimizedOverview stats={stats} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Failed to load dashboard stats</p>
                  <button
                    onClick={fetchStats}
                    className="mt-4 text-blue-600 hover:text-blue-500"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'brands' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Brands management coming soon...</p>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Locations management coming soon...</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Reviews management coming soon...</p>
            </div>
          )}

          {activeTab === 'platforms' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Platforms management coming soon...</p>
            </div>
          )}

          {activeTab === 'users' && user.role === 'super_admin' && (
            <div className="text-center py-12">
              <p className="text-gray-500">Users management coming soon...</p>
            </div>
          )}

          {activeTab === 'users' && user.role !== 'super_admin' && (
            <div className="text-center py-12">
              <p className="text-gray-500">You don&apos;t have permission to manage users.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
