"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "elp:favorite-team";

/**
 * Gemmer brugerens favorithold lokalt på enheden (§2, §17). Intet login,
 * ingen server-side lagring af personoplysninger.
 */
export function useFavoriteTeam() {
  const [favoriteTeamId, setFavoriteTeamIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setFavoriteTeamIdState(stored);
    } catch {
      // localStorage kan være utilgængelig (privat browsing) - fald tilbage
      // til intet valgt hold uden at fejle appen.
    }
    setHydrated(true);
  }, []);

  const setFavoriteTeamId = useCallback((teamId: string | null) => {
    setFavoriteTeamIdState(teamId);
    try {
      if (teamId) {
        window.localStorage.setItem(STORAGE_KEY, teamId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignorer lagringsfejl - valget gælder stadig for den aktuelle session.
    }
  }, []);

  return { favoriteTeamId, setFavoriteTeamId, hydrated };
}
