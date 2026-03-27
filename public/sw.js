const CACHE_NAME = "48n-pump-booking-v2";
const APP_SHELL = [
  "/book",
  "/book?source=app",
  "/manifest.webmanifest",
  "/48n-icon-192.png",
  "/48n-icon-512.png",
  "/48n-apple-touch.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isBookingNavigation =
    event.request.mode === "navigate" && url.pathname.startsWith("/book");
  const isStaticAsset = ["style", "script", "image", "font"].includes(
    event.request.destination,
  );

  if (isBookingNavigation) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/book")),
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(event.request).then((response) => {
          const clone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });

          return response;
        });
      }),
    );
  }
});
