"use client";

import { useEffect, useState } from "react";

export function PortalPwaRegister() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone,
      );

    setIsStandalone(standalone);
    document.body.dataset.appMode = standalone ? "standalone" : "browser";

    if (standalone) {
      return;
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
    };
  }, []);

  if (isStandalone || dismissed) {
    return null;
  }

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
      return;
    }

    setDismissed(true);
  }

  return (
    <div className="portal-install-banner">
      <div className="portal-install-copy">
        <strong>Save to home screen</strong>
        <span>
          Open the dispatch portal like an app — no browser, just tap and go.
        </span>
      </div>
      <div className="portal-install-actions">
        {installPrompt ? (
          <button
            className="primary-button portal-install-button"
            onClick={handleInstall}
            type="button"
          >
            Install App
          </button>
        ) : (
          <p className="portal-install-hint">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </p>
        )}
        <button
          className="secondary-link"
          onClick={() => setDismissed(true)}
          type="button"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}
