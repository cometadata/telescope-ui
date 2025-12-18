"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TokenState {
  token: string | null;
  error: string | null;
  loading: boolean;
}

interface UseRequestTokenReturn extends TokenState {
  getHeaders: () => Record<string, string>;
  refreshToken: () => Promise<void>;
}

export function useRequestToken(): UseRequestTokenReturn {
  const [state, setState] = useState<TokenState>({
    token: null,
    error: null,
    loading: true,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchToken = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/token");

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const data = await response.json();
      setState({ token: data.token, error: null, loading: false });

      // Schedule refresh before expiry (refresh at 80% of lifetime)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const refreshIn = (data.expiresIn || 300) * 0.8 * 1000;
      refreshTimeoutRef.current = setTimeout(fetchToken, refreshIn);
    } catch (err) {
      setState({
        token: null,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchToken();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchToken]);

  const getHeaders = useCallback((): Record<string, string> => {
    if (!state.token) return {};
    return { "X-Request-Token": state.token };
  }, [state.token]);

  return {
    ...state,
    getHeaders,
    refreshToken: fetchToken,
  };
}
