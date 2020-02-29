class Camera {
	constructor( videoNode ) {
		console.log( 'Camera class init' );
		this.videoNode = videoNode;
	}

	openCamera() {
		navigator.mediaDevices.getUserMedia( {
			audio: false,
			video: { width: 300, height: 300 }
		} ).then( stream => {
			alert('stream');
			this.videoNode.srcObject = stream;
			this.stream = stream;
		} ).catch(e => alert(e));
	}

	closeCamera() {
		this.videoNode.pause();
		if ( this.stream ) {
			this.stream.getTracks()[ 0 ].stop();
		}
	}

	takePhoto() {
		// crear elemento canvas para renderizar la foto
		let canvas = document.createElement('canvas');

		canvas.setAttribute('width', 300);
		canvas.setAttribute('height', 300);

		// contexto del canvas
		let context = canvas.getContext('2d');

		context.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

		this.photo = context.canvas.toDataURL();

		canvas = null;
		context = null;

		return this.photo;
	}
}
