var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');


// For New Data Set ,Uncomment the code below to :
// 1.Detect Faces from complete images
// 2.Save 150x150 faces with class names for each
// 3.Use Some of these to train the classifier
// 4.Save Trained Data into Model.json
// 5.Test for remaining faces


/*
Below Works Perfectly to Extract 150x150 faces from images and saves them to faces
*/
// const image = fr.loadImage('./pictures/nb3.jpg');//Manually change this path
// const detector = fr.FaceDetector();
// const targetSize = 150;
// const faceImages = detector.detectFaces(image, targetSize);

//Save faceImages to pictures/faces/face_0.jpg ++
// faceImages.forEach((img, i) => fr.saveImage(`./pictures/faces/face_${i}.png`,img));

/*
Now Manually Rename the faces from [face_1].png to [CorrectName]_1.png
*/

/*
Optional
Open Xquartz for below 3 lines to display mesh of faces
*/
// const win = new fr.ImageWindow();
// win.setImage(fr.tileImages(faceImages));
// fr.hitEnterToContinue();


/*
We have 4-5 pictures for each character
we use 2 to train and rest to test our training
*/
// const dataPath = path.resolve('./pictures/faces');
// const classNames = ['Linkin', 'Michael', 'Sucre', 'Tbag','nishant'];
// //
// const allFiles = fs.readdirSync(dataPath);
// const imagesByClass = classNames.map(c =>
//   allFiles
//     .filter(f => f.includes(c))
//     .map(f => path.join(dataPath, f))
//     .map(fp => fr.loadImage(fp))
// );
//
// const numTrainingFaces = 2;
// const trainDataByClass = imagesByClass.map(imgs => imgs.slice(0, numTrainingFaces));
// const testDataByClass = imagesByClass.map(imgs => imgs.slice(numTrainingFaces));

/*
Train our recognizer
*/
// const recognizer = fr.FaceRecognizer();
//
// trainDataByClass.forEach((faces, label) => {
//   const name = classNames[label];
//   recognizer.addFaces(faces, name);
// });

/*
Save Our Trained Data
*/
// const modelState = recognizer.serialize();
// fs.writeFileSync('model.json', JSON.stringify(modelState));

/*
Load Our Previously Saved Train Data
*/
// const modelState = require('../model.json');
// recognizer.load(modelState);


/*
Recognizing New Faces
*/
// const errors = classNames.map(_ => []);
// testDataByClass.forEach((faces, label) => {
//   const name = classNames[label];
//   console.log();
//   console.log('testing %s', name);
//   faces.forEach((face, i) => {
//     const prediction = recognizer.predictBest(face);
//     console.log('%s (%s)', prediction.className, prediction.distance);
//
//     // count number of wrong classifications
//     if (prediction.className !== name) {
//       errors[label] = errors[label] + 1;
//     }
//   });
// });

/*
print the result
*/
// const result = classNames.map((className, label) => {
//   const numTestFaces = testDataByClass[label].length;
//   const numCorrect = numTestFaces - errors[label].length;
//   const accuracy = parseInt((numCorrect / numTestFaces) * 10000) / 100;
//   return `${className} ( ${accuracy}% ) : ${numCorrect} of ${numTestFaces} faces have been recognized correctly`;
// })
// console.log('result:');
// console.log(result);


router.get('/',function(req, res){
  res.render('index');
});

router.get('/recognize',function(req,res){

  const recognizer = fr.FaceRecognizer();
  /*
  Load Our Previously Saved Train Data
  */
  const modelState = require('../model.json');
  recognizer.load(modelState);

  /*
  Detect Face From Image
  */
  const image = fr.loadImage('./tmp/uploads/out.png');
  const detector = fr.FaceDetector();
  const targetSize = 150;
  const faceImage = detector.detectFaces(image, targetSize);

  /*
  draw rect on Face
  and write prediction on each Face
  */
  const faceRects  = detector.locateFaces(image).map(mmodRect => mmodRect.rect);
  const faces = detector.getFacesFromLocations(image, faceRects, 150);

  if(faceRects.length){
    const win= new fr.ImageWindow();
    win.setImage(image);
    faceRects.forEach((rect,i)=>{
      win.addOverlay(rect);
      const predict = recognizer.predictBest(faces[i],0.69);
       win.addOverlay(rect, `${predict.className} (${predict.distance})`);

  });
    // fr.hitEnterToContinue();
  }

  /*
  Send Output for one face to html page
  */
  if(faceImage.length){
  const predictions=recognizer.predict(faceImage[0]);
  res.send(predictions);
  }
  else{
    res.status(400).json({msg:'Could Not Detect Face, Please try another picture'});
  }

});


module.exports = router;
