import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
        // Show a prompt to user if needed
    },
    onOfflineReady() {
        // Ready to work offline
    },
  });
}
