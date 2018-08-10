let ConstructionError = new Error("The input has to be a layer configuration [as an Array] or another AvoNet!");
let InputError = new Error("The Input has to be an ARRAY with as much elements as the input nodes!");
let IOError = new Error("The Input/Output has to be an ARRAY with as much elements as the input/output nodes!");

let sigmoid = (x) => 1 / (1 + Math.pow(Math.E, -x));

let dsigmoid = (x) => sigmoid(x) * (1 - sigmoid(x));

let logit = (y) => Math.log(y / (1 - y));

let simple = (x) => (x > 0) ? 1 : 0;

class AvoNet { //Add function that checks for negative values in config
  constructor(layer_configuration) {
    if (layer_configuration instanceof AvoNet) {

      this.nodes = layer_configuration.nodes.slice();
      this.weights = layer_configuration.weights.slice();
      this.bias = layer_configuration.bias.slice();
      this.config = JSON.parse(JSON.stringify(layer_configuration.config));
      this.rate = layer_configuration.rate;

    } else if (Array.isArray(layer_configuration)) {

      this.config = this.initConfig(layer_configuration);
      this.nodes = this.initNodes();
      this.weights = this.initWeights();
      this.bias = this.initBias();
      this.rate = 0.1;

    } else {

      throw ConstructionError;

    }
  }

  initConfig(conf) {
    let layer = conf.length;
    let conf_JSON = JSON.stringify(conf);
    let outputs = conf.pop();
    let inputs = conf.shift();
    let hidden = (conf.length > 0) ? conf.slice() : null;
    return {
      layer,
      inputs,
      hidden,
      outputs,
      conf_JSON
    };
  }

  initNodes() {
    return JSON.parse(this.config.conf_JSON);
  }

  initWeights() {
    let weights = new Array(this.config.layer - 1).fill(0);
    weights = weights.map((weight, i) => new Matrix(this.nodes[i + 1], this.nodes[i]));
    weights.forEach(weight => weight.randomize())
    return weights;
  }

  initBias() {
    return new Array(this.config.layer - 1).fill(0).map(bias => Math.random());
  }

  download() {
    let name = "AvoNet_" + this.config.layer + "_layer.json";
    saveFile(name, JSON.stringify(this));
  }

  clone() {
    return new AvoNet(this);
  }

  error(input,real) {
    let guess = Matrix.fromArray(this.guess(input));
    real = Matrix.fromArray(real);
    let error = Matrix.sub(real, guess);
    return error.toArray_flat().reduce((x,y) => x+y);
  }

  guess(input) {
    if (!Array.isArray(input) || input.length != this.config.inputs) {
      throw InputError;
    }
    let value = Matrix.fromArray(input);
    this.weights.forEach((weight, index) => {
      value = Matrix.prod(weight, value);
      //value.add(this.bias[index]);
      value.map(sigmoid);
    });
    return value.toArray_flat();
  }

  think(output) {
    //backwards output -> input
  }

  train(input, real) {
    if (!Array.isArray(input) ||
      !Array.isArray(real) ||
      input.length != this.config.inputs ||
      real.length != this.config.outputs) {
      throw IOError;
    }
    let guess = Matrix.fromArray(this.guess(input));
    real = Matrix.fromArray(real);
    let inp = Matrix.fromArray(input);
    let error = Matrix.sub(real, guess);
    let err;
    //calc outputs
    let outputs = new Array(this.config.layer);
        outputs[0] = inp.copy();
      this.weights.forEach((weight, index) => {
        inp = Matrix.prod(weight, inp);
        //inp.add(this.bias[index]);
        inp.map(sigmoid);
        outputs[index+1] = inp.copy();
      });


    for (let i = this.weights.length - 1; i >= 0; i--) {
      if(i == this.weights.length - 1) {
        err = error;
      } else {
        err = Matrix.prod(this.weights[i],error); //calculates the error on each layer
      }
      let out = outputs[i+1].copy();
      let gradient = Matrix.add(Matrix.invert(out),1);
          gradient = Matrix.mult(out,gradient);
          gradient = Matrix.mult(err,gradient);
          gradient = Matrix.prod(gradient,outputs[i].transpose());
          gradient.mult(this.rate);
          this.weights[i].sub(gradient);
    }
  }


}







//
