import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<App />
);

// Register the service worker for PWA offline caching (production only)
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/service-worker.js', { scope: '/' })
			.catch(() => {
				/* registration failed — app still works online */
			});
	});
}
