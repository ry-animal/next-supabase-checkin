'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from './components/sidebar';
import { UserNav } from './components/user-nav';
import CheckinButton from './components/checkin-button';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState({
    message: '',
    isLoading: false,
    error: '',
    streak: 0,
    totalCheckins: 0,
    alreadyCheckedIn: false,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Check if we're on desktop
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Initial check
    checkIfDesktop();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfDesktop);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Fetch user stats on page load
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingStats(true);

        const response = await fetch('/api/user-stats');

        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const data = await response.json();

        setCheckinStatus((prev) => ({
          ...prev,
          streak: data.streak || 0,
          totalCheckins: data.totalCheckins || 0,
          alreadyCheckedIn: !!data.alreadyCheckedIn,
          message: data.alreadyCheckedIn ? "You've already checked in today!" : '',
        }));
      } catch (err) {
        console.error('Error fetching user stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCheckin = async () => {
    try {
      setCheckinStatus((prev) => ({ ...prev, isLoading: true, error: '' }));

      // Call the check-in API endpoint
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in');
      }

      setCheckinStatus({
        message: data.alreadyCheckedIn
          ? "You've already checked in today!"
          : 'Check-in successful!',
        isLoading: false,
        error: '',
        streak: data.streak || 0,
        totalCheckins: data.totalCheckins || data.count || 0,
        alreadyCheckedIn: !!data.alreadyCheckedIn,
      });
    } catch (err) {
      console.error('Check-in error:', err);
      setCheckinStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to check in. Please try again.',
      }));
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-10" style={{ width: '16rem' }}>
        <div className="h-full">
          <AppSidebar isOpen={true} onOpenChange={() => {}} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/50" />
          <div className="fixed inset-y-0 left-0 z-40 w-64">
            <AppSidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="w-full" style={{ marginLeft: isDesktop ? '16rem' : 0 }}>
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center h-16 px-4 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
          <button
            onClick={toggleSidebar}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 dark:text-gray-200"
          >
            ☰
          </button>
          <div className="ml-4 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Check-in</h1>
          </div>
          <UserNav />
        </header>

        {/* Main Content Area */}
        <main className="p-8 bg-white dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto">
            <div className="max-w-md mx-auto my-8 text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                Welcome to Daily Check-in
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Check in once per day to build your streak and track your consistency.
              </p>

              {checkinStatus.message && (
                <div
                  className={`mb-6 rounded-lg p-4 text-center ${
                    checkinStatus.error
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : checkinStatus.alreadyCheckedIn
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  <p className="font-medium">{checkinStatus.message}</p>
                  {!checkinStatus.error && (
                    <p className="mt-2 text-sm">
                      {checkinStatus.alreadyCheckedIn
                        ? 'Come back tomorrow to continue your streak!'
                        : 'Great job staying consistent!'}
                    </p>
                  )}
                </div>
              )}

              {checkinStatus.error && (
                <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {checkinStatus.error}
                </div>
              )}

              <div className="mb-8 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                      {isLoadingStats ? '...' : checkinStatus.streak}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Current Streak</p>
                </div>

                <div className="text-center">
                  <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                      {isLoadingStats ? '...' : checkinStatus.totalCheckins}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Check-ins</p>
                </div>
              </div>

              <CheckinButton
                onClick={handleCheckin}
                isLoading={checkinStatus.isLoading}
                isDisabled={checkinStatus.alreadyCheckedIn}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
