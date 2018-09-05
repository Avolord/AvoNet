

let ImgC = new AvoNet([784,100,10]);

let interval;
let curr_num = 0;
let batch_size = 4;
let data_size = 60000;
let epochs = 0;
let max_epochs = 1;
let starting_time;

function start() {
  let time = data_size/batch_size/3600*max_epochs;
  console.log("Training started!");
  console.log("The Neuronal Network will train for "+max_epochs+" epochs à "+data_size+" elements");
  console.log("Estimated time the training will take: "+Math.round(time*100)/100+" Minutes");
  interval = requestAnimationFrame(draw);
  Training.drawImage(0, c.width/2);
  starting_time = new Date().getTime();
}

document.getElementById("Task").innerHTML = "Image Classifier | Iteration: ";

function draw() {
  if(!Training) {
    requestAnimationFrame(draw);
    return;
  }

  if(epochs == max_epochs) {
    let time = (new Date().getTime() - starting_time) / 1000 / 60;
    console.log("Training Done! The Neuronal Network has trained for "+epochs+" epochs.");
    console.log("Elapsed time since the training started: "+Math.round(time*100)/100+" Minutes!");
    return
  }

  if(Training.index >= data_size) {
    Training.index=0;
    curr_num = 0;
    epochs++;
    console.log("Epoch "+epochs+" completed! "+max_epochs-epochs+" epochs remaining.");
  }

  let train;
  for(let i=0;i<batch_size;i++) {
  train = Training.getImage();
  ImgC.train(train.data,train.target);
  }


  document.getElementById("Task").innerHTML = "Image Classifier | Iteration: "+ImgC.gen;
  let guess = Training.guessImage(ImgC,curr_num);
  document.getElementById("guess").innerHTML = "Number : "+guess.number+" with : "+guess.perc+" %";

  if(ImgC.gen % 200 == 0) {
    console.log("Image Nr."+ImgC.gen+" is now being drawn!");
    console.log("Error of Image Nr."+ImgC.gen+" is "+ImgC.error(train.data,train.target));
    curr_num += 200;
    Training.drawImage(ImgC.gen,c.width/2)
  }
  interval = requestAnimationFrame(draw);
}

function DoIT() {
  console.log("STARTING!")
  let start = new Date().getTime();
  for(let i=0;i<60000;i++) {
    let train = Training.getImage();
    ImgC.train(train.data,train.target);
  }
  console.log("IT FUCKIN TOOK ME "+new Date().getTime() - start+" Milliseconds!")
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

// let net = new AvoNet([1,2,1],1);
// let inp = [0.5];
// let tar = [0.1];
// let amount = 0;
// let s = new Date().getTime();
// console.log("Guess : "+net.guess(inp));
// console.log("Error : "+net.error(inp,tar));
// console.log("Training for : "+amount+" times.")
// for(let i=0;i<amount;i++) {
//   net.train(inp,tar);
// }
// console.log("new Guess : "+net.guess(inp));
// console.log("new Error : "+net.error(inp,tar));
// console.log("Training took: "+(new Date().getTime()-s)/1000+"Seconds")
