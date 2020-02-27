importScripts( 'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js' );
importScripts( 'js/sw-db.js' );
importScripts( 'js/sw-utils.js' );

const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHEL = [
	'/',
	'index.html',
	'css/style.css',
	'img/favicon.ico',
	'img/avatars/hulk.jpg',
	'img/avatars/ironman.jpg',
	'img/avatars/spiderman.jpg',
	'img/avatars/thor.jpg',
	'img/avatars/wolverine.jpg',
	'js/app.js',
	'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
	'https://fonts.googleapis.com/css?family=Quicksand:300,400',
	'https://fonts.googleapis.com/css?family=Lato:400,300',
	'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
	'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
	'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
	'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js',
	'libs/mdtoast/mdtoast.min.css',
	'libs/mdtoast/mdtoast.min.js',
];

self.addEventListener( 'install', e => {
	const staticCache = caches.open( STATIC_CACHE ).then( cache => cache.addAll( APP_SHEL ) );
	const inmutableCache = caches.open( INMUTABLE_CACHE ).then( cache => cache.addAll( APP_SHELL_INMUTABLE ) );

	e.waitUntil( Promise.all( [staticCache, inmutableCache] ) );
} );

self.addEventListener( 'activate', e => {
	const res = caches.keys().then( keys => {
		keys.forEach( key => {
			if ( key !== STATIC_CACHE && key.includes( 'static' ) ) {
				return caches.delete( key );
			}

			if ( key !== DYNAMIC_CACHE && key.includes( 'dynamic' ) ) {
				return caches.delete( key );
			}
		} );
	} );

	e.waitUntil( res );
} );

self.addEventListener( 'fetch', e => {
	let res;

	if ( e.request.url.includes( '/api' ) ) {
		res = apiMsgsManager( DYNAMIC_CACHE, e.request );
	} else {
		res = caches.match( e.request ).then( res => {
			if ( res ) {
				updateStaticCache( STATIC_CACHE, e.request, APP_SHELL_INMUTABLE );
				return res;
			}

			return fetch( e.request ).then( newRes => {
				return updateDynamicCache( DYNAMIC_CACHE, e.request, newRes );
			} );
		} );
	}

	e.respondWith( res );
} );

self.addEventListener( 'sync', e => {
	console.log('Sync manager');

	if ( e.tag === 'new-message' ) {

		const res = postMessage();

		e.waitUntil( res );
	}
} );
