"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Stille fejl - appen virker stadig online uden service worker.
      });
    }
  }, []);

  return null;
}
