class Camera {
	constructor(videoNode) {
		console.log('Camera class init');
		this.videoNode = videoNode;
	}

	openCamera() {
		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {width: 300, height: 300}
		});
	}

	closeCamera() {}
}
