function updateDynamicCache( cacheName, req, res ) {
	if ( res.ok ) {
		return caches.open( cacheName ).then( cache => {
			cache.put( req, res.clone() );
			return res.clone();
		} );
	} else {
		return res;
	}
}

function updateStaticCache( staticCache, req, APP_SHELL_INMUTABLE ) {
	if ( !APP_SHELL_INMUTABLE.includes(req.url) ) {
		return fetch( req )
		.then( res => {
			return updateDynamicCache( staticCache, req, res );
		});
	}
}
