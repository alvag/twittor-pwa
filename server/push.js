const vapid = require( './vapid.json' );
const URLSafeBase64 = require( 'urlsafe-base64' );
const fs = require( 'fs' );
const webpush = require( 'web-push' );

webpush.setVapidDetails(
	'mailto:alva85@gmail.com',
	vapid.publicKey,
	vapid.privateKey
);

let subscriptions = require( './subs-db.json' );

module.exports.getKey = () => {
	return URLSafeBase64.decode( vapid.publicKey );
};

module.exports.addSubscription = sub => {
	subscriptions.push( sub );

	fs.writeFileSync( `${__dirname}/subs-db.json`, JSON.stringify( subscriptions ) );
};

module.exports.sendPush = post => {

	const sentNotifications = [];

	subscriptions.forEach( ( subs, i ) => {
		sentNotifications.push(
			webpush.sendNotification( subs, JSON.stringify( post ) )
			// .then( console.log( 'push sent' ) )
			.catch( err => {
				if ( err.statusCode === 410 ) {
					subscriptions[ i ].delete = true;
				}
			} )
		);
	} );

	Promise.all( sentNotifications ).then( () => {
		subscriptions = subscriptions.filter( subs => !subs.delete );

		fs.writeFileSync( `${__dirname}/subs-db.json`, JSON.stringify( subscriptions ) );
	} );

};
