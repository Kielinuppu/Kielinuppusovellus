import { useState, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useCache<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const TTL = 10 * 60 * 60 * 1000; // 10 tuntia millisekunneissa

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tarkista välimuisti
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached);
          const isExpired = Date.now() - entry.timestamp > TTL;
          
          if (!isExpired) {
            setData(entry.data);
            setLoading(false);
            return;
          }
        }

        // Hae uusi data jos välimuisti on tyhjä tai vanhentunut
        const freshData = await fetcher();
        
        // Päivitä välimuisti
        const cacheEntry: CacheEntry<T> = {
          data: freshData,
          timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
        
        setData(freshData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetcher, TTL]);

  return { data, loading, error };
}