import React, { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, Moon, Sun, Bell, User, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/hooks/useTheme';
import { Switch } from '@/components/ui/switch';

/**
 * Settings page component with appearance settings and theme toggle
 */
export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  // State for notification toggles
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    promotional: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl p-4">
        <header className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/home">
              <div className="flex items-center text-primary hover:text-primary/80 cursor-pointer">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </div>
            </Link>
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        </header>

        <main className="space-y-8">
          {/* Appearance Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
              {isDark ? 
                <Moon className="h-5 w-5 mr-2 text-indigo-300" /> : 
                <Sun className="h-5 w-5 mr-2 text-amber-500" />
              }
              Appearance
            </h2>
            <div className="space-y-6">
              <div className="border-b dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="dark-mode-toggle" className="flex items-center cursor-pointer">
                    <Moon className="h-5 w-5 mr-3" />
                    <span className="font-medium text-foreground">Dark Mode</span>
                  </label>
                  <ThemeToggle />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Preview</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div 
                    className={`bg-white border-2 rounded-md p-4 shadow-sm transition-all duration-300 cursor-pointer ${!isDark ? 'border-primary' : 'border-gray-200'}`}
                    onClick={() => isDark && toggleTheme()}
                  >
                    <h4 className="font-medium mb-2 flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-amber-500" />
                      Light
                    </h4>
                    <p className="text-sm text-gray-600">
                      Preview how the app looks in light mode
                    </p>
                  </div>
                  <div 
                    className={`bg-gray-900 border-2 rounded-md p-4 shadow-sm text-white transition-all duration-300 cursor-pointer ${isDark ? 'border-primary' : 'border-gray-800'}`}
                    onClick={() => !isDark && toggleTheme()}
                  >
                    <h4 className="font-medium mb-2 flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-indigo-300" />
                      Dark
                    </h4>
                    <p className="text-sm text-gray-400">
                      Preview how the app looks in dark mode
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            onClick={() => setLocation('/account-settings')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    Account
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile and preferences</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
              <Bell className="h-5 w-5 mr-3 text-primary" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="push-notifications" className="font-medium text-foreground cursor-pointer">
                  Push Notifications
                </label>
                <Switch 
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange('push')}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="email-notifications" className="font-medium text-foreground cursor-pointer">
                  Email Notifications
                </label>
                <Switch 
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="promotional" className="font-medium text-foreground cursor-pointer">
                  Promotional Updates
                </label>
                <Switch 
                  id="promotional"
                  checked={notifications.promotional}
                  onCheckedChange={() => handleNotificationChange('promotional')}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}