class TData {
  constructor(Data, width = 28, height = 28) {
    this.Data = Data;
    this.width = width;
    this.height = height;
    this.line = this.width * this.height;
    this.index = 0;
  }
  getImage(index = this.index) {
    if (index >= this.Data.length) {
      return null;
    }
    this.index++;

    let data = "[".concat(this.Data[index][0]).concat("]");
    data = JSON.parse(data);
    let num = data.shift();
    data = data.map(value => value / 255 * 0.99 + 0.01);
    let target = new Array(10).fill(0.01);
    target[num] = 0.99;
    return {
      data,
      num,
      target
    };
  }

  guessImage(Net, index) {
    if (index >= this.Data.length) {
      return null;
    }

    let data = "[".concat(this.Data[index][0]).concat("]");
    data = JSON.parse(data);
    data.shift();
    data = data.map(value => value / 255 * 0.99 + 0.01);

    let guess = Net.guess(data);

    let number = 0;
    guess.forEach((element,index) => number = (element > guess[number]) ? index : number);

    return {number,perc:Math.round(guess[number]*100*1000)/1000};
  }

  guessImageLOG(Net, index) {
    if (index >= this.Data.length) {
      return null;
    }

    console.log("Preparing Image Data...");
    let deltaT = new Date().getTime();

    let data = "[".concat(this.Data[index][0]).concat("]");
    data = JSON.parse(data);
    data.shift();
    data = data.map(value => value / 255 * 0.99 + 0.01);

    deltaT = new Date().getTime() - deltaT;
    console.log("Image Data is prepared! Time this process took: "+deltaT+" milliseconds.");

    console.log("Initializing the Forward Propagation!");
    deltaT = new Date().getTime();

    let guess = Net.guess(data);

    deltaT = new Date().getTime() - deltaT;
    console.log("Done! Time this process took: "+deltaT+" milliseconds.");
    console.log("Preparing results...");

    let number = 0;
    guess.forEach((element,index) => number = (element > guess[number]) ? index : number);

    console.log("The result is : "+number+" with a certanty of : "+Math.round(guess[number]*100000)/1000+" %.");
  }

  drawImage(index, width = c.width, height = c.height, x=0, y=0) {

    let data = "[".concat(this.Data[index][0]).concat("]");
    data = JSON.parse(data);
    data.shift();

    let scaling_x = width / this.width;
    let scaling_y = height / this.height;

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let c = data[i + j * this.width];
        ctx.fillStyle = "rgb("+c+","+c+","+c+")";
        ctx.fillRect(i*scaling_x+x, j*scaling_y+y, scaling_x, scaling_y);
      }
    }
  }
}

let Training;

function handleFiles(files) {
  // Check for the various File API support.
  if (window.FileReader) {
    // FileReader are supported.
    getAsText(files[0]);
  } else {
    alert('FileReader are not supported in this browser.');
  }
}

function getAsText(fileToRead) {
  var reader = new FileReader();
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  var csv = event.target.result;
  processData(csv);
}

function processData(csv) {
  var allTextLines = csv.split(/\r\n|\n/);
  var lines = [];
  for (var i = 0; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(';');
    var tarr = [];
    for (var j = 0; j < data.length; j++) {
      tarr.push(data[j]);
    }
    lines.push(tarr);
  }
  Training = new TData(lines);
}

function errorHandler(evt) {
  if (evt.target.error.name == "NotReadableError") {
    alert("Canno't read file !");
  }
}
