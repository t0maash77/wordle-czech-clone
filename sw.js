const staticDevCoffee = "dev-coffee-site-v1"
const assets = [
    "/",
    "index.html",
    "./css/board.css",
    "./css/effects.css",
    "./css/general.css",
    "./js/app.js",
    "./js/czech.js",
    "./js/animations.js",
    "./js/allPossibleWords.js",
]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticDevCoffee).then(cache => {
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})