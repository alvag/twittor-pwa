var swReg;

if ( navigator.serviceWorker ) {
	window.addEventListener( 'load', function() {
		navigator.serviceWorker.register( '/sw.js' )
		.then( function( reg ) {
			swReg = reg;
			swReg.pushManager.getSubscription().then( checkSubscription );
		} );
	} );
}

// Referencias de jQuery

var titulo = $( '#titulo' );
var nuevoBtn = $( '#nuevo-btn' );
var salirBtn = $( '#salir-btn' );
var cancelarBtn = $( '#cancel-btn' );
var postBtn = $( '#post-btn' );
var avatarSel = $( '#seleccion' );
var timeline = $( '#timeline' );

var modal = $( '#modal' );
var modalAvatar = $( '#modal-avatar' );
var avatarBtns = $( '.seleccion-avatar' );
var txtMensaje = $( '#txtMensaje' );

var btnActivadas = $( '.btn-noti-activadas' );
var btnDesactivadas = $( '.btn-noti-desactivadas' );

// El usuario, contiene el ID del héroe seleccionado
var usuario;


// ===== Codigo de la aplicación

function crearMensajeHTML( mensaje, personaje ) {

	var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

	timeline.prepend( content );
	cancelarBtn.click();

}


// Globals
function logIn( ingreso ) {

	if ( ingreso ) {
		nuevoBtn.removeClass( 'oculto' );
		salirBtn.removeClass( 'oculto' );
		timeline.removeClass( 'oculto' );
		avatarSel.addClass( 'oculto' );
		modalAvatar.attr( 'src', 'img/avatars/' + usuario + '.jpg' );
	} else {
		nuevoBtn.addClass( 'oculto' );
		salirBtn.addClass( 'oculto' );
		timeline.addClass( 'oculto' );
		avatarSel.removeClass( 'oculto' );

		titulo.text( 'Seleccione Personaje' );

	}

}


// Seleccion de personaje
avatarBtns.on( 'click', function() {

	usuario = $( this ).data( 'user' );

	titulo.text( '@' + usuario );

	logIn( true );

} );

// Boton de salir
salirBtn.on( 'click', function() {

	logIn( false );

} );

// Boton de nuevo mensaje
nuevoBtn.on( 'click', function() {

	modal.removeClass( 'oculto' );
	modal.animate( {
		marginTop: '-=1000px',
		opacity: 1
	}, 200 );

} );

// Boton de cancelar mensaje
cancelarBtn.on( 'click', function() {
	if ( !modal.hasClass( 'oculto' ) ) {
		modal.animate( {
			marginTop: '+=1000px',
			opacity: 0
		}, 200, function() {
			modal.addClass( 'oculto' );
			txtMensaje.val( '' );
		} );
	}
} );

// Boton de enviar mensaje
postBtn.on( 'click', function() {

	var mensaje = txtMensaje.val();
	if ( mensaje.length === 0 ) {
		cancelarBtn.click();
		return;
	}

	fetch( '/api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify( { message: mensaje, user: usuario } )
	} )
	.then( res => res.json() )
	.then( res => {
		console.log( res );
	} )
	.catch( err => console.log( err ) );

	crearMensajeHTML( mensaje, usuario );

} );

// Obtener mensajes del servidor

function getMessages() {
	fetch( '/api' )
	.then( res => res.json() )
	.then( msgs => {
		console.log( msgs );

		msgs.forEach( msg => crearMensajeHTML( msg.message, msg.user ) );
	} );
}

getMessages();


// detectar conexión a internet

function isOnline() {
	if ( navigator.onLine ) {
		mdtoast( 'Online', {
			interaction: true,
			interactionTimeout: 1000,
			actionText: 'OK'
		} );
	} else {
		mdtoast( 'Offline', {
			interaction: true,
			actionText: 'OK',
			type: 'warning'
		} );
	}
}

window.addEventListener( 'online', isOnline );
window.addEventListener( 'offline', isOnline );

isOnline();


// Notificaciones

function checkSubscription( active ) {
	if ( active ) {
		btnActivadas.removeClass( 'oculto' );
		btnDesactivadas.addClass( 'oculto' );
	} else {
		btnActivadas.addClass( 'oculto' );
		btnDesactivadas.removeClass( 'oculto' );
	}
}

// checkSubscription();

function sendNotification() {
	const notificationOpts = {
		body: 'Este es el cuerpo de la notificacion',
		icon: 'img/icons/icon-72x72.png'
	};

	const n = new Notification( 'Hola Mundo!', notificationOpts );

	n.onclick = () => {
		console.log( 'Click!' );
	};
}

function requestNotification() {
	if ( window.Notification ) {

		if ( Notification.permission === 'granted' ) {
			sendNotification();
		} else if ( Notification.permission !== 'denied' || Notification.permission === 'default' ) {
			Notification.requestPermission( function( permission ) {
				console.log( permission );
				if ( permission === 'granted' ) {
					sendNotification();
				}
			} );
		}


	}
}

// requestNotification();

// get key
function getPublicKey() {
	return fetch( 'api/key' )
	.then( res => res.arrayBuffer() )
	.then( key => new Uint8Array( key ) );
}

// getPublicKey().then( console.log );

btnDesactivadas.on( 'click', function() {
	if ( swReg ) {
		getPublicKey().then( key => {
			swReg.pushManager.subscribe( {
				userVisibleOnly: true,
				applicationServerKey: key
			} ).then( res => res.toJSON() )
			.then( sub => {
				// console.log(sub);

				fetch( 'api/subscribe', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify( sub )
				} )
				.then( checkSubscription )
				.catch( cancelSubscription );

				// checkSubscription( sub );
			} );
		} );
	}
} );

function cancelSubscription() {
	swReg.pushManager.getSubscription()
	.then( subs => {
		subs.unsubscribe().then( () => checkSubscription( false ) );
	} );
}

btnActivadas.on( 'click', function() {
	cancelSubscription();
} );
