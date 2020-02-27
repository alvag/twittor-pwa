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

function updateStaticCache( cacheName, req, APP_SHELL_INMUTABLE ) {
	if ( !APP_SHELL_INMUTABLE.includes( req.url ) ) {
		return fetch( req ).then( res => updateDynamicCache( cacheName, req, res ) );
	}
}

function apiMsgsManager( cacheName, req ) {

	if ( req.clone().method === 'POST' ) {

		if ( self.registration.sync ) {
			return req.clone().text().then( body => {
				const bodyObj = JSON.parse( body );
				return saveMessage( bodyObj );
			} );
		} else {
			return fetch( req );
		}
	} else {
		return fetch( req ).then( res => {
			if ( res.ok ) {
				updateDynamicCache( cacheName, req, res.clone() );
				return res.clone();
			} else {
				return caches.match( req );
			}
		} ).catch( () => caches.match( req ) );
	}

}
