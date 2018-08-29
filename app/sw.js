let cacheName = 'restaurant-reviews-v1';

self.addEventListener('install',(event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll([
                '/',
                'css/styles.css',
                'css/responsive.css',
                'bundle_js/main.bundle.js',
                'bundle_js/restaurant.bundle.js',
                'manifest.json',
                'img/icon-192.png',
                'img/icon-512.png'
            ]);
        })

    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then((cacheNames)=> {
            cacheNames.filter((cacheNames)=> {
                return cacheNames.startsWith('restaurant-reviews-') && cacheNames != cacheName ;
            }).map((cacheNames)=> {
                return caches.delete(cacheNames);
            })
        })
    );
});

self.addEventListener('fetch', (event) => {
   
    const reqUrl = event.request.url;
    
    let url = new URL(event.request.url);

    if (url.pathname.startsWith('/restaurants')) {
       return;
    }

    if (url.pathname.startsWith('/browser-sync')) {
        return;
    }

    if (url.pathname.startsWith('/reviews')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((res) => {
            if(res) return res;
            return fetch(event.request).then((res) => {
                if(!(reqUrl.match('mapbox') )){
                    let clone = res.clone();
                    caches.open(cacheName).then((cache) => {
                        cache.put(reqUrl, clone);
                    });
                }
                return res;
            });
        })
    );
});
