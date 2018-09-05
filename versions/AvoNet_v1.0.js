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
      this.gen = layer_configuration.gen;

    } else if (Array.isArray(layer_configuration)) {

      this.config = this.initConfig(layer_configuration);
      this.nodes = this.initNodes();
      this.weights = this.initWeights();
      this.bias = this.initBias();
      this.rate = 0.3;
      this.gen = 0;

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
    return new Array(this.config.layer - 1).fill(0).map(bias => Math.random()*2-1);
  }

  download() {
    let name = "AvoNet_" + this.config.layer + "_layer.json";
    saveFile(name, JSON.stringify(this));
  }

  clone() {
    return new AvoNet(this);
  }

  error(input, real) {
    let guess = Matrix.fromArray(this.guess(input));
    real = Matrix.fromArray(real);
    let error = Matrix.sub(real, guess);
    return error.toArray_flat().map(x => x * x).reduce((x, y) => x + y);
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

    this.gen++;

    //transform the targets into a matrix
    let target = Matrix.fromArray(real);

    //transform the inputs into a matrix
    let layer = Matrix.fromArray(input);


    //prepare the nodes [first layer contains the inputs]
    let layers = [layer.copy()];

    //calculate values of the nodes [forward propagation]
    this.weights.forEach(weight => {

      //add all the connections to each node together
      layer = Matrix.prod(weight, layer);
      //apply the activation function
      layer.map(sigmoid);
      //push each layer into a layers array
      layers.push(layer.copy());

    });

    let final_output = layers[layers.length-1];

    //compute the output_error
    let final_error = Matrix.sub(target, final_output);
    //define another error variable [for later use]
    let err;

    //backwards propagation [loop backwards through the weights to alter them consecutively]
    for (let i = this.weights.length - 1; i >= 0; i--) {
      //the first error is just target-guess
      if (i == this.weights.length - 1) {
        err = final_error;
      }
      //the other errors / gradients have to be computed differently e.g [e_h = W_ho^T * e_o]
      else {
      //calculates the error on each layer
        err = Matrix.prod(this.weights[i + 1].transpose(), err);
      }

      // we need next and previous because the weights connect 2 layers
      // it's [i+1] because you have one more layer than weights
      let layer_a = layers[i + 1].copy();
      let layer_b = layers[i].transpose();

      //compute the gradient in 5 steps
      // learning_rate * error * layer_a * (1 - layer_a) * layer_b^T

      let gradient;
      // 1.) (1 - layer_a) or. ( -layer_a + 1 )
          gradient = Matrix.add(Matrix.invert(layer_a), 1);
      // 2.)  layer_a * [(1 - layer_a)]
          gradient = Matrix.mult(layer_a, gradient);
      // 3.)  error * [layer_a * (1 - layer_a)]
          gradient = Matrix.mult(err, gradient);
      // 4.) [error * layer_a * (1 - layer_a)] * layer_b^T
          gradient = Matrix.prod(gradient, layer_b);
      // 5.) learning_rate * [error * layer_a * (1 - layer_a) * layer_b^T]
      let delta_W = Matrix.mult(gradient,this.rate);

      this.weights[i].add(delta_W);

    }
  }


}







//
