

function reduceSample() {

  // First, imperative approach

  var shoppingList = [
    { name: "orange", units: 2, price: 10, type: "fruits" },
    { name: "lemon", units: 1, price: 15, type: "fruits" },
    { name: "fish", units: 0.5, price: 30, type: "meat" }
  ];

  var totalPrice = 0, fruitsPrice = 0;
  for (var i = 0; i < shoppingList.length; i++) {
    var line = shoppingList[i];
    totalPrice += line.units * line.price;
    if (line.type === "fruits") {
      fruitsPrice += line.units * line.price;
    }
  }

  console.log(`totalPrice: ${totalPrice} fruitsPrice: ${fruitsPrice}`);

  // This is the functional approach

  totalPrice = shoppingList.reduce(computePrice, 0);
  fruitsPrice = shoppingList.filter(areFruits).reduce(computePrice, 0);

  console.log(`totalPrice: ${totalPrice} fruitsPrice: ${fruitsPrice}`);
}

function computePrice(totalPrice, line) {
  return totalPrice + (line.units * line.price);
}

function areFruits(line) {
  return line.type === "fruits";
}

function higherOrderFunctionsSample() {

  let numbers = [1, 2, 3, 4, 5, 6];

  //filter
  function isEven(x) {
    return x % 2 === 0;
  }

  let evenNumbers = numbers.filter(isEven);

  console.log('evenNumbers: ', evenNumbers);

  //map, transform each value of a array
  function double(x) {
    return x * 2;
  }

  let doubleNumbers = numbers.map(double);

  console.log('doubleNumbers: ', doubleNumbers);

  //reduce, accumulates all values of the collection into one value
  function sum(total, value) {
    return total + value;
  }

  let total = numbers.reduce(sum, 0);

  console.log('total: ', total);

}

function doWithLoading(fn) {
  console.log('start loading');
  let returnValue = fn();
  console.log('end loading');
  return returnValue;
}

function process() {
  console.log('do process');
}

function customHigherOrderFunctionSample() {

  doWithLoading(process);

}

// Using closure, we can create a function with private state.
function createGenerator(prefix) {
  let index = 0;
  return function generateNewID() {
    index++;
    return prefix + index.toString();
  }
}

function closureSample() {
  let generateNewID = createGenerator("btn");
  console.log(generateNewID());
  console.log(generateNewID());
  console.log(generateNewID());
}

function decoratorSample() {

  // A function decorator is a higher-order function that takes one function as an argument 
  // and returns another function, and the returned function is a variation of the argument function.

  function once(fn) {
    let returnValue;
    let canRun = true;

    return function runOnce() {
      if (canRun) {
        returnValue = fn.apply(this, arguments);
        canRun = false
      }
      return returnValue;
    }
  }


  var processOnce = once(process);
  processOnce();
  processOnce();
  processOnce();
}



module.exports.reduceSample = reduceSample;
module.exports.higherOrderFunctionsSample = higherOrderFunctionsSample;
module.exports.customHigherOrderFunctionSample = customHigherOrderFunctionSample;
module.exports.closureSample = closureSample;
module.exports.decoratorSample = decoratorSample;