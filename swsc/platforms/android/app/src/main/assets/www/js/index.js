const PARAMS = {
	
	// request the max possible width in order to fill the screen
	MAX_WIDTH: 4096,
	
	// request the max possible height in order to fill the screen
	MAX_HEIGHT: 2160,
	
	// when checking for the hand, anything above this brightness is taken as the hand
	MIN_HAND_BRIGHTNESS: 250,
	
	// kernel_order*kernel_order = dimensions of the blurring kernel
	KERNEL_ORDER: 7,
	
	// the minimum ratio of (bright pixels) : (total screen pixels) that indicates a hand is entering the box
	MIN_HAND_PRESENT: 0.15,
	
	// if the ratio of (bright pixels) : (total screen pixels) is below this, the hand is too far away
	HAND_TOO_FAR: 0.5,
	
	// if the ratio of (bright pixels) : (total screen pixels) is above this, the hand is too near
	HAND_TOO_NEAR: 0.75,
	
	// the number of seconds the hand must be held still for to be captured
	SECONDS_UNTIL_CAPTURE: 3,
	
	// the number of milliseconds between checking the camera for the hand
	DETECTION_PERIOD: 1000,
	
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
	
	// the red value for the heat map colouring
	HM_RED: 255,
	
	// the blue value for the heat map colouring
	HM_BLUE: 0,
	
	// the alpha value for the heat map coluring
	HM_ALPHA: 255,
	
	// any pixel below this intensity isn't "clean" enough
	CLEAN_CUTOFF: 50
	
};

let cvItems = {
    	
	colour: null,
	grey: null,
	
	cap: null,
	
	kernel: null,
	
	contours: null,
	hierarchy: null,
	handContour: null
    	
};

const BLACK = 0;
const WHITE = 255;

const GET_HAND_FRONT = 0;
const GET_HAND_BACK = 1;
const HAND_TOO_FAR = 2;
const HAND_TOO_NEAR = 3;
const KEEP_HAND_STILL = 4;
const REMOVE_HAND = 5;

const OVERLAY_MESSAGES = [
	
	"Please apply the glow-gel and then place your hand in the box, with the palm of your hand facing UP",
	"Please place your hand in the box again, this time with the palm of your hand facing DOWN",
	"Detecting hand... please move your hand nearer to the camera",
	"Detecting hand... please move your hand further away from the camera",
	"Hand detected, please hold still...",
	"First picture taken, please remove your hand from the box"
	
];

var app = {
	
    permissions: null,
    
    video: null,
    setUpVideoComplete: false,
    
    userStatus: null,
    pictureTakenAlready: false,
    
    height: window.innerHeight,
    width: window.innerWidth,
    area: window.innerHeight*window.innerWidth,
    
    init: function() {
    	
        document.addEventListener('deviceready', app.ready);
        
    },
    
    ready: function() {
    	
    	app.permissions = cordova.plugins.permissions;
    	
    	document.getElementById('beginButton').addEventListener('click', app.beginHandTest);
    	document.getElementById('homeButton').addEventListener('click', app.returnHome);
    	document.getElementById('resultButton').addEventListener('click', app.getOtherResult);
    	
    	app.video = document.getElementById("cameraStream");
    	app.video.height = app.height;
    	app.video.width = app.width;
    	
    	app.nav("Loading", "Home");
    	
    },
    
    beginHandTest: function() {
    	
    	app.nav("Home", "Loading");
    	
    	app.pictureTakenAlready = false;
    	
    	document.getElementById("resultText").innerHTML = "BACK";
    	document.getElementById("front").display = "inline-block";
    	document.getElementById("back").display = "none";
    	
    	if (!app.setUpVideoComplete) {
    		
    		app.setUpCameraPermission();
    		
    		app.setUpCameraStream();
    		
    	} else {
    		
    		app.video.play();
    	
	    	app.updateUserStatus(GET_HAND_FRONT);
    	
    		app.nav("Loading", "Camera");
    		
    		document.getElementById("homeButton").style.display = "inline-block";
    	
    		app.showOverlay(true);
    	
    		app.detectHand();
    		
    	}
    	
    },
    
    setUpCameraPermission: function() {
    	
    	if (window.cordova.platformId == "android") {
    	
	    	let cameraPermission = "android.permission.CAMERA";
	    	
	    	app.permissions.checkPermission(cameraPermission, checkedCameraPermission, app.reportError);
	    	
	    	function checkedCameraPermission(status) {
	    		
	    		if (!status.hasPermission) {
	    			
	    			app.permissions.requestPermission(cameraPermission, requestedCameraPermission, app.reportError);
	    			
	    		}
	    		
	    	}
	    	
	    	function requestedCameraPermission(status) {
	    		
	    		if (!status.hasPermission) {
	    			
	    			alert("App cannot proceed without permission to use the Camera, try again");
    			
	   				app.setUpCameraPermission();
	    			
	    		}
	    		
	    	}
    	
    	}
    	
    },

    setUpCameraStream: function() {
    	
    	let mediaRequestSpecs = {
			
			video: {
				
				width: { ideal: PARAMS.MAX_WIDTH },
				height: { ideal: PARAMS.MAX_HEIGHT },
				facingMode: "environment"
				
			}
			
    	};
	
		navigator.mediaDevices.getUserMedia(mediaRequestSpecs).then(gotUserMedia).catch(app.reportError);
		   
		function gotUserMedia(stream) {
			
			if ("srcObject" in app.video) {
				
				app.video.srcObject = stream;
				
			} else {
				
				app.video.src = window.URL.createObjectURL(stream);
				
			}
			
			app.video.onloadedmetadata = function() {
				
				app.video.play();
				
				app.setUpVideoComplete = true;
				
				app.updateUserStatus(GET_HAND_FRONT);
    	
		    	app.nav("Loading", "Camera");
		    	
		    	document.getElementById("homeButton").style.display = "inline-block";
		    	
		    	app.showOverlay(true);
		    	
		    	app.detectHand();
				
			};
			
		}
    },
    
    detectHand: function() {
    	
    	cvItems.colour = new cv.Mat(app.height, app.width, cv.CV_8UC4);
    	
    	cvItems.grey = new cv.Mat(app.height, app.width, cv.CV_8UC1);
    	
    	let cameraStream = cvItems.colour;
    	
    	let cameraStreamGreyscale = cvItems.grey;
    	
		cvItems.cap = new cv.VideoCapture(app.video);
		
		cvItems.kernel = cv.Mat.eye(PARAMS.KERNEL_ORDER, PARAMS.KERNEL_ORDER, cv.CV_32FC1);
		
		cvItems.contours = new cv.MatVector();
		cvItems.hierarchy = new cv.Mat();
		
		let loopsHandDetected = 0;
		
		function checkForHand() {
			
			let tmp = cv.Mat.zeros(cvItems.grey.rows, cvItems.grey.cols, cvItems.grey.type());
			
			let begin = Date.now();
			
			cvItems.cap.read(cameraStream);
	
			// reduce the image of the hand to greyscale for filtering
			cv.cvtColor(cameraStream, cameraStreamGreyscale, cv.COLOR_RGBA2GRAY);
		
			// this filter removes unwanted contours from the hand interior and raises brightness
			// this makes the outline of the hand stand out more so it can be more easily identified
			cv.filter2D(cameraStreamGreyscale, tmp, cv.CV_8U, cvItems.kernel);
		
			// apply a binary threshold to separate the hand from the background
			cv.threshold(tmp, tmp, PARAMS.MIN_HAND_BRIGHTNESS, WHITE, cv.THRESH_BINARY);
		
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
			
			cvItems.handContour = maxIndex;
			
			tmp.delete();
			
			if ((app.userStatus == GET_HAND_FRONT) || (app.userStatus == GET_HAND_BACK)) {
				
				if ((maxArea/app.area) > PARAMS.MIN_HAND_PRESENT) {
					
					loopsHandDetected = 0;
					
					app.updateUserStatus(HAND_TOO_FAR);
					
				}
				
			} else if (app.userStatus == REMOVE_HAND) {
				
				if ((maxArea/app.area) < PARAMS.MIN_HAND_PRESENT) {
					
					loopsHandDetected = 0;
					
					app.updateUserStatus(GET_HAND_BACK);
					
				}
				
			} else {
				
				if ((maxArea/app.area) < PARAMS.HAND_TOO_FAR) {
					
					loopsHandDetected = 0;
					
					app.updateUserStatus(HAND_TOO_FAR);
					
				} else if ((maxArea/app.area) > PARAMS.HAND_TOO_NEAR) {
					
					loopsHandDetected = 0;
					
					app.updateUserStatus(HAND_TOO_NEAR);
					
				} else {
					
					loopsHandDetected++;
					
					app.updateUserStatus(KEEP_HAND_STILL);
					
				}
				
			}
			
			if (loopsHandDetected < PARAMS.SECONDS_UNTIL_CAPTURE) {
				
				let delay = PARAMS.DELAY_PERIOD - (Date.now() - begin);
				
				setTimeout(checkForHand, delay);
				
			} else {
				
				app.video.pause();
				
				if (!app.pictureTakenAlready) {
					
					app.pictureTakenAlready = true;
    	
    				app.drawHeatmap("front");
    				
				} else {
    	
			    	app.showOverlay(false);
			    	
			    	app.nav("Camera", "Loading");
			    	
			    	app.drawHeatmap("back");
					
				}
				
			}
			
		}
		
		setTimeout(checkForHand, 0);
		
    },
    
    drawHeatmap: function(side) {
    	
    	let cameraStream = cvItems.colour;
    	
    	let cameraStreamGreyscale = cvItems.grey;
		
		let tmp = cv.Mat.zeros(cvItems.grey.rows, cvItems.grey.cols, cvItems.grey.type());
	
		// draw the shape of the hand for use as a mask
		cv.drawContours(tmp, cvItems.contours, cvItems.handContour, new cv.Scalar(WHITE), cv.FILLED);
	
		// apply the hand-shape mask to the greyscale image to eliminate the background completely
		// after this we have successfully captured the hand by itself
		cameraStreamGreyscale.copyTo(tmp, tmp);
	
		// create the heatmap of the hand to show where needs more washing
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
			let colour = new cv.Scalar(PARAMS.HM_RED, redToYellow, PARAMS.HM_BLUE, PARAMS.HM_ALPHA);
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
			
		cv.imshow(side, heatmap);
		
		if (side == "front") {
    	
    		document.getElementById("resultButton").style.display = "none";
    		app.nav("Camera", "Result");
    	
	    	setTimeout(function() {
	    	
	    		app.nav("Result", "Camera");
	    		document.getElementById("resultButton").style.display = "inline-block";
	    	
		    	app.updateUserStatus(REMOVE_HAND);
		    	
		    	app.video.play();
		    	
		    	app.detectHand();
		    	
	    	}, 250);
			
		} else {
	    	
	    	app.nav("Loading", "Result");
			
		}
	
		/* ------- CALCULATE HAND SCORE -------
	
		// filter out the pixels that aren't "clean" enough
		cv.threshold(tmp, tmp, PARAMS.CLEAN_CUTOFF, WHITE, cv.THRESH_BINARY);
		
		// count the number of "clean" pixels in the hand
		let cleanArea = cv.countNonZero(tmp);
	
		// the cleanliness score is the ratio of clean pixels to total pixels in the hand
		let cleanlinessScore = (cleanArea/handArea)*100;
		alert("Your hand cleanliness score is: " + cleanlinessScore.toFixed(2) + "%");
		
		------------------------------------ */
		
	},
	
	nav: function(prev, nxt) {
		
		document.getElementById(prev).style.display = "none";
		document.getElementById(nxt).style.display = "inline-block";
		
	},
	
	returnHome: function() {
		
		app.video.pause();
		
		document.getElementById("homeButton").style.display = "none";
		document.getElementById("Camera").style.display = "none";
		document.getElementById("Result").style.display = "none";
		document.getElementById("Home").style.display = "inline-block";
		
	},
	
	getOtherResult: function() {
		
		let nxtResult = document.getElementById("resultText").innerHTML;
			
		document.getElementById("front").style.display = (nxtResult == "FRONT") ? "inline-block" : "none";
		document.getElementById("back").style.display = (nxtResult == "BACK") ? "inline-block" : "none";
		document.getElementById("resultText").innerHTML = (nxtResult == "FRONT") ? "BACK" : "FRONT";
		
	},
	
	updateUserStatus: function(status) {
		
		app.userStatus = status;
		document.getElementById("overlayText").innerHTML = OVERLAY_MESSAGES[status];
		
	},
	
	showOverlay: function(show) {
		
		let newDisplay = (show ? "inline-block" : "none");
		document.getElementById("overlay").style.display = newDisplay;
		
	},
	
	reportError: function(error) {
		
		console.log("Name: " + error.name + ", Message: " + error.message);
		
	}
    
};

app.init();