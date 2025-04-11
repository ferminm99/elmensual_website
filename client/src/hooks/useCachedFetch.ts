import { useEffect, useState } from "react";
import axios from "axios";
import baseUrl from "../apiConfig";

export function useCachedFetch<T>(
  endpoint: string,
  cacheKey: string,
  skipFetchIfCached = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      setData(parsed);
      setLoading(false);

      if (skipFetchIfCached) return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${baseUrl}${endpoint}`);
        setData(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      } catch (err) {
        console.error("Error en useCachedFetch:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (!cached || !skipFetchIfCached) {
      fetchData();
    }
  }, [endpoint, cacheKey, skipFetchIfCached]);

  return { data, loading, error };
}
