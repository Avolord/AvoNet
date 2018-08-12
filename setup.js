

let ImgC = new AvoNet([784,100,10]);

let interval;
let curr_num = 0;

function start() {
  console.log("Training started!");
  interval = requestAnimationFrame(draw);
  Training.drawImage(0)
}

document.getElementById("Task").innerHTML = "Image Classifier | Iteration: ";

function draw() {
  if(!Training) {
    requestAnimationFrame(draw);
    return;
  }

  if(Training.index >= 60000) {
    Training.index=0;
  }

  let train;
  for(let i=0;i<2;i++) {
  train = Training.getImage();
  ImgC.train(train.data,train.target);
  }

  document.getElementById("Task").innerHTML = "Image Classifier | Iteration: "+ImgC.gen;
  let guess = Training.guessImage(ImgC,curr_num);
  document.getElementById("guess").innerHTML = "Number : "+guess.number+" with : "+guess.perc+" %";

  if(ImgC.gen % 1000 == 0) {
    console.log(ImgC.error(train.data,train.target));
    curr_num += 1000;
    Training.drawImage(ImgC.gen)
  }
  interval = requestAnimationFrame(draw);
}


let saveFile = function(filename, data) {
    var blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}
