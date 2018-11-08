

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


module.exports.reduceSample = reduceSample;