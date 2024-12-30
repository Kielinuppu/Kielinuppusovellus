'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';
// Poistetaan Analytics-tyypin importtaus koska sitä ei käytetä tässä tiedostossa

export default function AnalyticsComponent() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && analytics) {
      logEvent(analytics, 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}