(() => {
  ((self.__WB_DISABLE_DEV_LOGS = !0),
    self.addEventListener("push", function (n) {
      if (n.data) {
        const t = n.data.json(),
          i = {
            body: t.body || "New notification from Proddy",
            icon: t.icon || "/logo-nobg.png",
            badge: "/favicon.ico",
            vibrate: [100, 50, 100],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: "1",
              url: t.url || "/",
            },
          };
        n.waitUntil(
          self.registration.showNotification(
            t.title || "Proddy Notification",
            i,
          ),
        );
      }
    }),
    self.addEventListener("notificationclick", function (n) {
      (n.notification.close(),
        n.waitUntil(
          clients.matchAll({ type: "window" }).then(function (t) {
            const i = n.notification.data.url || "/";
            for (let n = 0; n < t.length; n++) {
              const e = t[n];
              if (e.url === i && "focus" in e) return e.focus();
            }
            if (clients.openWindow) return clients.openWindow(i);
          }),
        ));
    }));
  const n = "/offline";
  (self.addEventListener("install", function (t) {
    t.waitUntil(
      caches.open("offline-cache").then(function (t) {
        return t.addAll([n, "/logo-nobg.png", "/favicon.ico"]);
      }),
    );
  }),
    self.addEventListener("fetch", function (t) {
      
    }));
})();
