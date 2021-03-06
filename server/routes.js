// Routes.js - Módulo de rutas
const express = require( 'express' );
const router = express.Router();
const push = require( './push' );

const msgs = [
	{
		_id: 1,
		user: 'spiderman',
		message: 'Hola Mundo'
	},
	{
		_id: 2,
		user: 'ironman',
		message: 'Hola Mundo'
	},
	{
		_id: 3,
		user: 'wolverine',
		message: 'Hola Mundo'
	}
];


// Get mensajes
router.get( '/', function( req, res ) {
	res.json( msgs );
} );

router.post( '/', function( req, res ) {
	const message = {
		message: req.body.message,
		user: req.body.user
	};

	msgs.push( message );

	console.log( msgs );

	res.json( {
		ok: true,
		message

	} );
} );


// Almacenar la suscripcion
router.post( '/subscribe', ( req, res ) => {
	const sub = req.body;

	push.addSubscription( sub );
	res.json( 'subscribe' );
} );

// Obtener key publico
router.get( '/key', ( req, res ) => {
	const key = push.getKey();
	res.send( key );
} );

// OEnvia notificación push
router.post( '/push', ( req, res ) => {

	const post = {
		title: req.body.title,
		body: req.body.body,
		user: req.body.user,
	};

	push.sendPush(post);

	res.json( post );
} );


module.exports = router;
