// src/hooks/useDataFetch.js
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Custom hook to fetch data from an API endpoint.
 * @param {string} endpoint - The API endpoint to fetch data from (e.g., 'expenses').
 * @param {boolean} shouldFetch - Flag to control when the fetch operation should run.
 * @returns {{data: any, loading: boolean, error: string | null, refetch: () => void}}
 */
export function useDataFetch(endpoint, shouldFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!shouldFetch) return;

    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(endpoint);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data from API.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, shouldFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}