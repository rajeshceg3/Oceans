import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({
    onNeedRefresh() {
        // Show a prompt to user if needed
        console.log('New content available, click to reload.');
    },
    onOfflineReady() {
        console.log('App ready to work offline');
    },
  });
}
