import { useState, useEffect } from 'react';

export function useCache<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false; // Varmistetaan, ettei päivityksiä tapahdu unmountin jälkeen
    const TTL = 10 * 60 * 60 * 1000; // Välimuistin aikaraja 10 tuntia

    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);

        // Tarkistetaan, onko välimuisti voimassa
        if (Date.now() - timestamp < TTL) {
          setData((prevData) => {
            if (JSON.stringify(prevData) !== JSON.stringify(cachedData)) {
              return cachedData; // Päivitetään vain, jos data on muuttunut
            }
            return prevData; // Ei päivitystä, jos data on sama
          });
          setLoading(false);
          return;
        }
      } catch  {
        // Jos välimuistin lukeminen epäonnistuu, poistetaan se
        localStorage.removeItem(key);
      }
    }

    // Haetaan uusi data, jos välimuisti ei kelpaa
    fetcher()
      .then((newData) => {
        if (!ignore) {
          setData(newData);
          localStorage.setItem(
            key,
            JSON.stringify({
              data: newData,
              timestamp: Date.now(),
            })
          );
        }
      })
      .catch((e) => setError(e))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    // Puhdistetaan efekti, kun komponentti unmountataan
    return () => {
      ignore = true;
    };
  }, [key, fetcher]); // key ja fetcher riippuvuuksina

  return { data, loading, error };
}
