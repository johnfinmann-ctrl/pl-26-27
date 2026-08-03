"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "elp:favorite-team";
const CHANGE_EVENT = "elp:favorite-team-changed";

/**
 * Gemmer brugerens favorithold lokalt på enheden (§2, §17). Intet login,
 * ingen server-side lagring af personoplysninger.
 *
 * Bruger useSyncExternalStore i stedet for useEffect+setState, så vi undgår
 * et unødvendigt kaskaderende re-render ved opstart (react-hooks'
 * set-state-in-effect-regel) og samtidig holder værdien korrekt
 * synkroniseret med localStorage, herunder på tværs af faner.
 */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage kan være utilgængelig (privat browsing) - fald tilbage
    // til intet valgt hold uden at fejle appen.
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

// Bruges udelukkende til at vide, om vi er hydreret på klienten endnu
// (server-snapshot=false, klient-snapshot=true), uden at bruge useEffect.
function getHydratedServerSnapshot() {
  return false;
}
function getHydratedClientSnapshot() {
  return true;
}
function subscribeNever() {
  return () => {};
}

export function useFavoriteTeam() {
  const favoriteTeamId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const hydrated = useSyncExternalStore(
    subscribeNever,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot
  );

  const setFavoriteTeamId = useCallback((teamId: string | null) => {
    try {
      if (teamId) {
        window.localStorage.setItem(STORAGE_KEY, teamId);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignorer lagringsfejl - valget gælder stadig for den aktuelle session.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { favoriteTeamId, setFavoriteTeamId, hydrated };
}
