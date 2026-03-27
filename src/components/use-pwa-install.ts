"use client";

import { useEffect, useState } from "react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  }
}

function detectIos() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function detectStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<
    "idle" | "installed" | "ios" | "ready"
  >(() => {
    if (detectStandalone()) {
      return "installed";
    }

    if (detectIos()) {
      return "ios";
    }

    return "idle";
  });

  useEffect(() => {
    function syncDisplayMode() {
      if (detectStandalone()) {
        setInstallState("installed");
        return;
      }

      if (detectIos() && !deferredPrompt) {
        setInstallState("ios");
      }
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      if (!detectStandalone()) {
        setInstallState("ready");
      }
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setInstallState("installed");
    }

    syncDisplayMode();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt]);

  async function promptInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const outcome = await deferredPrompt.userChoice;

    if (outcome.outcome === "accepted") {
      setInstallState("installed");
      setDeferredPrompt(null);
    }
  }

  return {
    installState,
    isStandalone: installState === "installed",
    promptInstall,
  };
}
