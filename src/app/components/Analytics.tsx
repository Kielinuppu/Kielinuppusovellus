'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from '@firebase/analytics';

export default function Analytics() {
const pathname = usePathname();

useEffect(() => {
  const userCode = localStorage.getItem('userCode');
  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
 
  if (pathname && analytics && userCode) {
    logEvent(analytics, 'user_activity', {
      user_name: userData?.Päiväkoti,
      page_title: getPageTitle(pathname),
      timestamp: new Date().toISOString(),
      session_id: generateSessionId(userCode)
    });
  }
 }, [pathname]);
 
 const generateSessionId = (userCode: string) => {
  return `${userCode}_${new Date().toISOString().split('T')[0]}`;
 };

const getPageTitle = (path: string) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return 'Etusivu';
  
  const pageNames: { [key: string]: string } = {
    'home': 'Kotisivu',
    'aiheet': 'Aiheet',
    'pelit': 'Pelit', 
    'audio': 'Audio',
    'pdf': 'PDF',
    'viewer': 'Katselin',
    'login': 'Kirjautuminen',
    'muskarit': 'Muskarit',
    'hakemisto': 'Hakemisto',
    'tutustu': 'Tutustu',
    'tietokanta': 'Tietokanta'
  };

  return pageNames[parts[0]] || parts[0];
};

return null;
}