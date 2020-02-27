const db = new PouchDB( 'messages' );

function saveMessage( message ) {
	message._id = new Date().toISOString();

	return db.put( message ).then( () => {

		self.registration.sync.register( 'new-message' );

		const newResp = { ok: true, offline: true };

		return new Response( JSON.stringify( newResp ) );
	} );
}

function postMessage() {
	const posts = [];

	return db.allDocs( { include_docs: true } ).then( docs => {
		docs.rows.forEach( row => {
			const doc = row.doc;

			const fetchProm = fetch( 'http://localhost:3000/api/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify( doc )
			} ).then( () => db.remove( doc ) );

			posts.push( fetchProm );
		} );

		return Promise.all( posts );
	} );
}
