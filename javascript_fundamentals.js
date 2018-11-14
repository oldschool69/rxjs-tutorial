function scopeSample() {

  for(var i = 0; i < 10; i++) {
    console.log(`i = ${i}`);
    var someValue = 100;
  }

  // Variaveis de escopo interno podem ser acessadas fora do escopo
  console.log(`i = ${i}`);
  console.log(`someValue = ${someValue}`);

}


function prototypeSample() {

  //Uma forma de criar objetos em javascript é utilizando
  //a propriedade prototype de uma function

  var createDog = function(name) {
    var newDog = Object.create(createDog.prototype);
    newDog.name = name;
    return newDog;
  };

  createDog.prototype.giveTreat = function () { 
    console.log(this.name + " bark bark bark") 
  };
  
  createDog.prototype.pet = function () { 
    console.log(this.name + " wags tail") 
  };

  var zeus = createDog('zeus');
  var casey = createDog('casey');

  zeus.giveTreat();
  casey.giveTreat();
  

}


module.exports.scopeSample = scopeSample;
module.exports.prototypeSample = prototypeSample;