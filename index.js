"use strict";

// Cool RxJs tutorial from https://www.sitepoint.com/rxjs-functions-with-examples/
// Real life applications for Observables on web development

const Rx = require('rxjs/Rx');
const request = require('request');
const observables = require('./observables');


const ENDPOINT = 'users';
const ROOT = 'https://jsonplaceholder.typicode.com';

const makeRequest = function makeRequest(path) {
  return new Promise(function (resolve, reject) {
    request(path, function (err, response, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body)); // parse response body to JSON, otherwise mapping operation bellow fails
      }
    })
  });
};


const $obs = Rx.Observable.fromPromise(makeRequest(ROOT + '/' + ENDPOINT));

$obs.
  flatMap(users => users). // for each object emmit a observable
  map((user) => user.website). //get only website data
  filter((website) => (website.endsWith('net') || website.endsWith('org'))). //do some filtering
  reduce((data, website) => { // So retorna quando o source Observable completa a execução. primeiro parametro é o acumulador
    return {
      count: data.count += 1,
      name_length: data.name_length += website.length
    }
  }, { count: 0, name_length: 0 }).
  subscribe(result => {
    const average_length = result.name_length / result.count;
    console.log('average length: ' + average_length);
  }
  );

$obs.
  flatMap(users => users).
  map((user) => user.website).
  filter((website => (website.endsWith('net') || website.endsWith('org')))).
  scan((data, website) => { // Mostra o resultado para cada site, acumulando no primeiro parâmetro 'data'
    return {
      website,
      count: data.count += 1,
      name_length: data.name_length += website.length
    }
  }, { count: 0, name_length: 0 }).
  //take(2). //limita a quantidade de resultados
  takeWhile((result) => result.count < 3). // retorna resultados quando uma condição é satisfeita
  subscribe(partialResult => {
    const average_length = partialResult.name_length / partialResult.count;
    console.log('website: ' + partialResult.website + ' average length (' + partialResult.count + '): ' + average_length);
  });


//Juntando streams com Concat e Merge

const arr1 = [
  { name: 'Josh', age: 15 },
  { name: 'Barbara', age: 12 },
  { name: 'Mike', age: 15 },
];


const arr2 = [
  { name: 'Michela', age: 14 },
  { name: 'Katrina', age: 13 },
  { name: 'Marvin', age: 25 },
];

// const $obs1 = Rx.Observable.from(arr1);
// const $obs2 = Rx.Observable.from(arr2);

const $obs1 = Rx.Observable.interval(100)
  .map(val => `Source 1: ${val}`)
  .take(5);

const $obs2 = Rx.Observable.interval(100)
  .map(val => `Source 2: ${val * 10}`)
  .take(5);


// $obs1
//   .concat($obs2) // Junta as streams em sequencia, primeiro os valores de $obs1 e $obs2 em seguida
//   .subscribe(value => {
//     console.log('Concat: ' + value);
//   }
//  );

$obs1
  .merge($obs2) // Nao espera a primeira stream finalizar para executar a segunda
  .subscribe(value => {
    console.log('Merge: ' + value);
  }
);


// more observable samples:

// observables.switchMapSample();
// observables.forkJoinSample();
// observables.concatAllSample();
observables.mergeAllSample();



