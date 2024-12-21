'use client'

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Määritellään tyyppi BeforeInstallPromptEvent:ille
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA asennettu onnistuneesti');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable || pathname !== '/home') return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button 
        onClick={handleInstallClick}
        className="bg-[#F6F7E7] p-4 rounded-full shadow-md hover:bg-[#F0F1E1] transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>Asenna sovellus</span>
      </button>
    </div>
  );
};

export default InstallPWA;