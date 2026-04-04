// Um Service Worker básico apenas para o navegador reconhecer como PWA
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});
self.addEventListener('fetch', (e) => {});
