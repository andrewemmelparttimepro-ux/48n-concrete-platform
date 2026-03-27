"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    function syncDisplayMode() {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

      document.body.dataset.appMode = standalone ? "standalone" : "browser";
    }

    if (!("serviceWorker" in navigator)) {
      syncDisplayMode();
      return;
    }

    syncDisplayMode();

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      syncDisplayMode();
    };

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failure should not block the booking flow.
    });

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  return null;
}
