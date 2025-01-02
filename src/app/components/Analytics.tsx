'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from '@firebase/analytics';
import { initUser, trackPage } from '@/lib/mixpanel';

interface UserData {
  Access: string;
  Admin: string;
  Created: string;
  ID: number;
  Koodi: string;
  "Nyt soi": string;
  Password: string;
  Päiväkoti: string;
  Updated: string;
  Username: string;
  "last used": string;
}

const Analytics: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Haetaan tai luodaan anonyymiID
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).substring(7);
        localStorage.setItem('visitorId', visitorId);
      }

      const userDataStr = localStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) as UserData : null;

      if (pathname) {
        if (userData) {
          // Kirjautuneen käyttäjän seuranta
          if (analytics) {
            logEvent(analytics, 'user_activity', {
              user_name: userData.Päiväkoti,
              page: pathname
            });
          }
          initUser(userData.Koodi, userData);
          trackPage(pathname, userData);
        } else {
          // Anonyymin käyttäjän seuranta
          if (analytics) {
            logEvent(analytics, 'visitor_activity', {
              user_name: 'Anonyymi vierailija',
              visitor_id: visitorId,
              page: pathname
            });
          }
          
          const anonymousUser = {
            Päiväkoti: 'Anonyymi vierailija',
            ID: parseInt(visitorId.replace('visitor_', '')),
            Koodi: visitorId,
            Access: '',
            Admin: '',
            Created: '',
            "Nyt soi": '',
            Password: '',
            Updated: '',
            Username: '',
            "last used": ''
          };
          
          trackPage(pathname, anonymousUser as UserData);
        }
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, [pathname]);

  return null;
};

export default Analytics;