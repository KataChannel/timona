'use client';

import React, { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { useSiteName } from '@/hooks/useSiteName';

interface PWAInstallPromptProps {
  className?: string;
  showDelay?: number; // Delay in milliseconds before showing prompt
  position?: 'top' | 'bottom' | 'center';
}

export function PWAInstallPrompt({ 
  className = '', 
  showDelay = 5000,
  position = 'bottom' 
}: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { siteName } = useSiteName();
  
  const { 
    capabilities, 
    installPrompt, 
    install,
    showNotification
  } = usePWA();

  // Check if we should show the install prompt
  useEffect(() => {
    if (!capabilities.canInstall || capabilities.isStandalone || dismissed) {
      return;
    }

    // Check if user has dismissed recently
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const minDelay = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (Date.now() - dismissedTime < minDelay) {
        return;
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [capabilities.canInstall, capabilities.isStandalone, dismissed, showDelay]);

  // Handle install
  const handleInstall = async () => {
    if (!installPrompt) return;

    setInstalling(true);
    try {
      await install();
      setShowPrompt(false);
      
      // Show success notification
      if (capabilities.hasNotificationSupport) {
        await showNotification('App Installed Successfully!', {
          body: `${siteName} has been installed to your device. You can now access it from your home screen.`,
          tag: 'pwa-install-success'
        });
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Handle "Maybe Later"
  const handleMaybeLater = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    // Show again after 3 days
    setTimeout(() => {
      setDismissed(false);
    }, 3 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || !capabilities.canInstall || capabilities.isStandalone) {
    return null;
  }

  const positionClasses = {
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div className={`
      fixed ${positionClasses[position]} z-50 max-w-sm mx-4
      bg-white rounded-lg shadow-2xl border border-gray-200
      animate-in slide-in-from-bottom-4 duration-300
      ${className}
    `}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Install {siteName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add to your home screen for quick access
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-2">
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Work offline</span>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Faster loading</span>
          </li>
          <li className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Push notifications</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="p-4 pt-2 space-y-2">
        <button
          onClick={handleInstall}
          disabled={installing}
          className="
            w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {installing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Installing...</span>
            </div>
          ) : (
            'Add to Home Screen'
          )}
        </button>
        
        <button
          onClick={handleMaybeLater}
          className="
            w-full text-gray-600 py-2 px-4 rounded-lg font-medium
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
            transition-colors duration-200
          "
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

// Mini install button for header/toolbar
export function PWAInstallButton({ 
  variant = 'default',
  size = 'medium',
  className = '' 
}: {
  variant?: 'default' | 'minimal' | 'icon';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const [installing, setInstalling] = useState(false);
  const { capabilities, install } = usePWA();

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  if (!capabilities.canInstall || capabilities.isStandalone) {
    return null;
  }

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    minimal: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    icon: 'p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className={`
          ${variantClasses[variant]} ${className}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        title="Install App"
        aria-label="Install App"
      >
        {installing ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `}
    >
      {installing ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Installing...</span>
        </div>
      ) : (
        <>
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Install App
        </>
      )}
    </button>
  );
}