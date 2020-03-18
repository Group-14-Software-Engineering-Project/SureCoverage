import * as handTrack from 'handtrackjs';

// const img = document.getElementById('img');

// // Load the model.
// handTrack.load().then(model => {
//   // detect objects in the image.
//   console.log("model loaded")
//   model.detect(img).then(predictions => {
//     console.log('Predictions: ', predictions); 
//   });
// });

let stream = navigator.mediaDevices.getUserMedia;

const video = document.querySelector('#video');
const audio = document.querySelector('#audio');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
let model;

handTrack.startVideo(video).then(status => {
  if(status){
    navigator.mediaDevices.getUserMedia({video: {}}, stream => {
      video.sourceObject = stream;
      setInterval(runDetection, 1000);
    },
    err => console.log("oh oh trouble!", err)
    );
  }
})



function runDetection() {
  model.dectect(video).then(predictions => {
    console.log(predictions);
    if(predictions.length > 0){
      <Text>HELLO</Text>
    }
  })
}

handTrack.load().then(lmodel => {
  model = lmodel;
});

