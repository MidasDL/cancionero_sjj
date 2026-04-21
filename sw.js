/* Service Worker — Cancionero SJJ */
const CACHE = "sjj-v3";

const PRECACHE = [
	"./",
	"./index.html",
	"./manifest.json",
	"./data/songs.json",
	"./data/categories.json",
	"./icon/favicon.ico",
	"./icon/favicon-16x16.png",
	"./icon/favicon-32x32.png",
	"./icon/apple-touch-icon.png",
	"./icon/android-chrome-192x192.png",
	"./icon/android-chrome-512x512.png",
	"./sounds/click.mp3",
	"./sounds/enter.mp3",
	"./sounds/back.mp3"
];

self.addEventListener("install", (evt) => {
	evt.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			// First, cache the static assets listed in PRECACHE
			await cache.addAll(PRECACHE);

			// Then, try to fetch `data/songs.json` and cache every song .txt file
			try {
				const resp = await fetch("./data/songs.json");
				if (resp && resp.ok) {
					const songs = await resp.json();
					const urls = songs.map(
						(s) => `./data/${String(s.song).padStart(3, "0")}.txt`
					);
					// Cache each song individually so we can report progress to clients.
					const total = urls.length;
					let done = 0;
					for (const u of urls) {
						try {
							const r = await fetch(u);
							if (r && r.ok) await cache.put(u, r.clone());
						} catch (err) {
							// ignore individual failures
						}
						done++;
						// Notify open clients about progress
						const cl = await self.clients.matchAll({
							includeUncontrolled: true
						});
						cl.forEach((c) =>
							c.postMessage({ type: "PRECACHE_PROGRESS", done, total })
						);
					}
					// Finalize progress
					const cl2 = await self.clients.matchAll({
						includeUncontrolled: true
					});
					cl2.forEach((c) => c.postMessage({ type: "PRECACHE_DONE", total }));
				}
			} catch (e) {
				// If network fails during install, we still keep the precached assets.
				console.warn("SW: could not pre-cache song files", e);
			}

			await self.skipWaiting();
		})()
	);
});

self.addEventListener("activate", (evt) => {
	evt.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
				)
			)
			.then(() => self.clients.claim())
	);
});

// Helper: check songs.json and update cached song files if changed
async function checkAndUpdateSongs() {
	try {
		const cache = await caches.open(CACHE);
		const resp = await fetch("./data/songs.json");
		if (!resp || !resp.ok) return;
		const songs = await resp.json();
		const urls = songs.map(
			(s) => `./data/${String(s.song).padStart(3, "0")}.txt`
		);
		const total = urls.length;
		let done = 0;
		for (const u of urls) {
			try {
				const netResp = await fetch(u, { cache: "no-cache" });
				if (!netResp || !netResp.ok) {
					// skip if network failed for this resource
					done++;
					const clients = await self.clients.matchAll({
						includeUncontrolled: true
					});
					clients.forEach((c) =>
						c.postMessage({ type: "UPDATE_PROGRESS", done, total })
					);
					continue;
				}

				const cachedResp = await cache.match(u);
				let shouldPut = false;

				const netTag =
					netResp.headers.get("ETag") || netResp.headers.get("Last-Modified");
				const cachedTag = cachedResp
					? cachedResp.headers.get("ETag") ||
						cachedResp.headers.get("Last-Modified")
					: null;

				if (!cachedResp) {
					shouldPut = true;
				} else if (netTag && cachedTag) {
					if (netTag !== cachedTag) shouldPut = true;
				} else {
					// No reliable validators — compare bodies (small text files)
					try {
						const [a, b] = await Promise.all([
							netResp.clone().text(),
							cachedResp.clone().text()
						]);
						if (a !== b) shouldPut = true;
					} catch (e) {
						shouldPut = true;
					}
				}

				if (shouldPut) {
					await cache.put(u, netResp.clone());
				}
			} catch (err) {
				// ignore individual errors
			}
			done++;
			const clients = await self.clients.matchAll({
				includeUncontrolled: true
			});
			clients.forEach((c) =>
				c.postMessage({ type: "UPDATE_PROGRESS", done, total })
			);
		}
		const clients = await self.clients.matchAll({ includeUncontrolled: true });
		clients.forEach((c) => c.postMessage({ type: "UPDATE_DONE", total }));
	} catch (e) {
		console.warn("SW: update check failed", e);
	}
}

self.addEventListener("fetch", (evt) => {
	const { request } = evt;
	const url = new URL(request.url);

	// Navigation requests → network first, fallback to cache (ensures updates are picked up)
	if (request.mode === "navigate") {
		evt.respondWith(
			fetch(request)
				.then((res) => {
					const clone = res.clone();
					caches.open(CACHE).then((c) => c.put(request, clone));
					return res;
				})
				.catch(() => caches.match("./index.html"))
		);
		return;
	}

	// Song txt files → cache on first access
	if (url.pathname.match(/\/data\/\d{3}\.txt$/)) {
		evt.respondWith(
			caches.match(request).then((cached) => {
				if (cached) return cached;
				return fetch(request)
					.then((res) => {
						if (res.ok) {
							const clone = res.clone();
							caches.open(CACHE).then((c) => c.put(request, clone));
						}
						return res;
					})
					.catch(
						() =>
							new Response("Letra no disponible.", {
								status: 404,
								headers: { "Content-Type": "text/plain; charset=utf-8" }
							})
					);
			})
		);
		return;
	}

	// Everything else → cache first, then network
	evt.respondWith(
		caches.match(request).then((cached) => cached || fetch(request))
	);
});

// Respond to messages from clients (page)
self.addEventListener("message", (ev) => {
	const msg = ev.data || {};
	if (msg && msg.type === "CHECK_FOR_UPDATES") {
		// Run update check in background
		ev.waitUntil(checkAndUpdateSongs());
	}
});
