const PARAMS = {
	
	// anything "cleaner" than this value will be ignored
	MAX_INTENSITY: 100,
	
	// anything "dirtier" than this value is the background
	MIN_INTENSITY: 30,
	
	// how much the mid-point of the current intensity range increases each loop
	// larger step = less colours "visited" = less variation in heatmap colour (so less insightful)
	INTENSITY_STEP: 2,
	
	// the exponential factor in the red to yellow transition
	// this is what determines the speed at which the red falls off to yellow
	RED_TO_YELLOW_FACTOR: 1.7,
	
	// any pixel below this intensity isn't "clean" enough
	CLEAN_CUTOFF: 50
	
};

let cvItems = {
    	
	colour: null,
	grey: null,
	
	cap: null,
	
	kernel: null,
	anchor: null,
	
	contours: null,
	hierarchy: null
    	
};

const BLACK = 0;
const WHITE = 255;

var app = {
	
    permissions: null,
    video: null,
    height: window.innerHeight,
    width: window.innerWidth,
    area: window.innerHeight*window.innerWidth,
    
    init: function() {
    	
        document.addEventListener('deviceready', app.ready);
        
    },
    
    ready: function() {
    	
    	app.permissions = cordova.plugins.permissions;
    	
    	document.getElementById('proceed').addEventListener('click', app.setUpCameraPermission);
    	
    	app.video = document.getElementById("cameraStream");
    	app.video.height = app.height;
    	app.video.width = app.width;
    	
    	document.getElementById("logo").height = 300;
    	document.getElementById("logo").width = 300;
    	
    	app.nav("Loading", "Home");
    	
    },
    
    setUpCameraPermission: function() {
    	
    	app.nav("Home", "Loading");
    	
    	if (window.cordova.platformId == "android") {
    	
	    	let cameraPermission = "android.permission.CAMERA";
	    	
	    	app.permissions.checkPermission(cameraPermission, doneCheckedCameraPermission, app.reportError);
	    	
	    	function doneCheckedCameraPermission(status) {
	    		
	    		if (status.hasPermission) {
	    			
	    			app.setUpCameraStream();
	    			
	    		} else {
	    			
	    			app.permissions.requestPermission(cameraPermission, doneRequestedCameraPermission, failRequestedCameraPermission);
	    			
	    		}
	    		
	    	}
	    	
	    	function doneRequestedCameraPermission() {
	    		
	    		app.setUpCameraStream();
	    		
	    	}
	    	
	    	function failRequestedCameraPermission(error) {
	    		
	    		if ((error.name == "NotAllowedError") || (error.name == "SecurityError")) {
	    			
	    			alert("App cannot proceed without permission to use the Camera, try again");
	    			
	    			app.setUpCameraPermission();
	    			
	    		} else {
	    			
	    			app.reportError(error);
	    			
	    		}
	    		
	    	}
    	
    	} else {
    		
    		app.setUpCameraStream();
    		
    	}
    	
    },

    setUpCameraStream: function() {
    	
    	let mediaRequestSpecs = {
    		
			audio: false,
			
			video: {
				
				width: { ideal: 4096 },
				height: { ideal: 2160 },
				facingMode: "environment"
				
			}
			
    	};
	
		navigator.mediaDevices.getUserMedia(mediaRequestSpecs).then(doneGetUserMedia).catch(app.reportError);
		   
		function doneGetUserMedia(stream) {
			
			if ("srcObject" in app.video) {
				
				app.video.srcObject = stream;
				
			} else {
				
				app.video.src = window.URL.createObjectURL(stream);
				
			}
			
			app.video.onloadedmetadata = function() {
				
				app.video.play();
				
				app.detectHand();
				
			};
			
		}
    },
    
    detectHand: function() {
    	
    	app.nav("Loading", "Camera");
    	
    	cvItems.colour = new cv.Mat(app.height, app.width, cv.CV_8UC4);
    	
    	cvItems.grey = new cv.Mat(app.height, app.width, cv.CV_8UC1);
    	
    	let cameraStream = cvItems.colour;
    	
    	let cameraStreamGreyscale = cvItems.grey;
    	
		cvItems.cap = new cv.VideoCapture(app.video);
		
		cvItems.kernel = cv.Mat.eye(7, 7, cv.CV_32FC1);
		cvItems.anchor = new cv.Point(-1, -1);
		
		cvItems.contours = new cv.MatVector();
		cvItems.hierarchy = new cv.Mat();
		
		let handDetected = false;
		
		function checkForHand() {
			
			let tmp = cv.Mat.zeros(cvItems.grey.rows, cvItems.grey.cols, cvItems.grey.type());
			
			let begin = Date.now();
			
			cvItems.cap.read(cameraStream);
	
			// reduce the image of the hand to greyscale for filtering
			cv.cvtColor(cameraStream, cameraStreamGreyscale, cv.COLOR_RGBA2GRAY, 0);
		
			// this filter removes unwanted contours from the hand interior and raises brightness
			// this makes the outline of the hand stand out more so it can be more easily identified
			cv.filter2D(cameraStreamGreyscale, tmp, cv.CV_8U, cvItems.kernel, cvItems.anchor, 0, cv.BORDER_DEFAULT);
		
			// apply a binary threshold to separate the hand from the background
			cv.threshold(tmp, tmp, 250, WHITE, cv.THRESH_BINARY);
			
			// ------- IDENTIFYING THE HAND -------
		
			// find the contours from the thresholded image
			cv.findContours(tmp, cvItems.contours, cvItems.hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);
		
			// search for the contour that has the largest area because that'll be the hand outline
			let maxArea = 0;
			let maxIndex = 0;
			for (let i = 0; i < cvItems.contours.size(); i++) {
				
				let thisArea = cv.contourArea(cvItems.contours.get(i));
				if (thisArea > maxArea) {
					
					maxArea = thisArea;
					maxIndex = i;
					
				}
		
			}
			
			tmp.delete();
			
			// if more than 75% of the screen is a hand we can pass it on for processing
			if ((maxArea/app.area) > 0.75) {
				
				handDetected = true;
				
				app.video.pause();
		
				app.processHand(maxArea, maxIndex);
				
			}
			
			if (!handDetected) {
				
				let delay = 1000 - (Date.now() - begin);
				
				setTimeout(checkForHand, delay);
				
			}
			
		}
		
		setTimeout(checkForHand, 0);
		
    },
    
    processHand: function(handArea, handContour) {
    	
    	let cameraStream = cvItems.colour;
    	
    	let cameraStreamGreyscale = cvItems.grey;
		
		let tmp = cv.Mat.zeros(cvItems.grey.rows, cvItems.grey.cols, cvItems.grey.type());
	
		// draw the shape of the hand for use as a mask
		cv.drawContours(tmp, cvItems.contours, handContour, new cv.Scalar(WHITE), cv.FILLED);
	
		// apply the hand-shape mask to the greyscale image to eliminate the background completely
		// after this we have successfully captured the hand by itself
		cameraStreamGreyscale.copyTo(tmp, tmp);
	
		// ------- MAKING A HEATMAP OF THE HAND -------
	
		// create a heatmap of the hand to show where needs more washing
		let heatmap = cv.Mat.zeros(cvItems.colour.rows, cvItems.colour.cols, cvItems.colour.type());
		
		// the mid-point of the current +/- range for capturing colour intensity (ie: cleanliness)
		let targetIntensity = PARAMS.MIN_INTENSITY;
	
		// the lower this value is the more red it is
		// the higher this value is the more yellow it is
		// increasing this each loop is what creates the heatmap
		let redToYellow = 0;
			
		// this value determines how much yellower the red gets each loop
		// it grows exponentially so that more of the hand is yellow than red
		let redToYellowIncrease = PARAMS.RED_TO_YELLOW_FACTOR;
	
		// each loop is the next colour/cleanliness band between the "dirtiest" and "cleanest"
		while (targetIntensity <= PARAMS.MAX_INTENSITY) {
			
			// the current colour in the [red -> yellow] range to be drawn on the heatmap
			let colour = new cv.Scalar(255, redToYellow, 0, 255);
			let colourSheet = new cv.Mat(cvItems.colour.rows, cvItems.colour.cols, cvItems.colour.type(), colour);
	
			// this mask eliminates any pixels "dirtier" than the current cleanliness band
			let maskLwr = new cv.Mat();
			cv.threshold(tmp, maskLwr, (targetIntensity - PARAMS.INTENSITY_STEP), WHITE, cv.THRESH_BINARY);
			
			// this mask eliminates any pixels "cleaner" than the current cleanliness band
			let maskUpr = new cv.Mat();
			cv.threshold(tmp, maskUpr, (targetIntensity + PARAMS.INTENSITY_STEP), WHITE, cv.THRESH_BINARY_INV);
			
			// combine the two masks to capture only the pixels that lie within the current cleanliness band
			let mask = cv.Mat.zeros(cvItems.grey.rows, cvItems.grey.cols, cvItems.grey.type());
			cv.bitwise_and(maskUpr, maskLwr, mask);
	
			// colour in the heatmap with the current colour at the pixels in the current cleanliness band
			colourSheet.copyTo(heatmap, mask);
			
			// release memory baggage
			colourSheet.delete();
			maskLwr.delete();
			maskUpr.delete();
	
			// advance the mid-point for the next cleanliness band
			// the doubling is because the mid-point must account for the +/- range
			targetIntensity += (2*PARAMS.INTENSITY_STEP);
	
			// apply the exponential growth to the speed of the transition from red to yellow
			redToYellowIncrease = (PARAMS.RED_TO_YELLOW_FACTOR*redToYellowIncrease);
	
			// make the colour of the next cleanliness band yellower since it'll be "cleaner"
			redToYellow += Math.round(redToYellowIncrease);
	
		}
		
		cv.imshow('canvasOutput', heatmap);
		app.nav("Camera", "Result");
	
		// ------- CALCULATE HAND SCORE -------
	
		// filter out the pixels that aren't "clean" enough
		cv.threshold(tmp, tmp, PARAMS.CLEAN_CUTOFF, WHITE, cv.THRESH_BINARY);
		
		// count the number of "clean" pixels in the hand
		let cleanArea = cv.countNonZero(tmp);
	
		// the cleanliness score is the ratio of clean pixels to total pixels in the hand
		let cleanlinessScore = (cleanArea/handArea)*100;
		alert("Your hand cleanliness score is: " + cleanlinessScore.toFixed(2) + "%");
		
	},
	
	nav: function(prev, nxt) {
		
		document.getElementById(prev).style.display = "none";
		document.getElementById(nxt).style.display = "inline";
		
	},
	
	reportError: function(error) {
		
		console.log("Name: " + error.name + ", Message: " + error.message);
		
	}
    
};

app.init();