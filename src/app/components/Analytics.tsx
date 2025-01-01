'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from '@firebase/analytics';
import { initUser, trackPage } from '@/lib/mixpanel';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const userCode = localStorage.getItem('userCode');
    const userDataString = localStorage.getItem('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    if (pathname && userCode && userData) {
      // Firebase tracking
      if (analytics) {
        logEvent(analytics, 'user_activity', {
          user_name: userData.Päiväkoti,
          page: pathname
        });
      }

      // Mixpanel tracking
      initUser(userCode, userData);
      trackPage(pathname, userData);
    }
  }, [pathname]);

  return null;
}