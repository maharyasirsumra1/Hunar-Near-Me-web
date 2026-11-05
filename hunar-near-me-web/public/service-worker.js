'use strict';

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL('/admin/' + (event.notification.data?.path || '#/notifications'), self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const adminWindow = windows.find(client => new URL(client.url).origin === self.location.origin
      && new URL(client.url).pathname.startsWith('/admin'));
    if (adminWindow) {
      await adminWindow.navigate(target);
      return adminWindow.focus();
    }
    return self.clients.openWindow(target);
  })());
});
