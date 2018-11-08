const { timer, interval, forkJoin, of, Observable, concat, merge } = require('rxjs');
const { switchMap, mergeMap, flatMap, delay, take, concatAll, map, mergeAll, tap } = require('rxjs/operators');





function switchMapSample() {

  const source = timer(0, 5000);

  const example = source
    .pipe(switchMap(() => interval(500)));

  example.subscribe(val => console.log(val));
}

function forkJoinSample() {

  const $obs1 = Observable.fromPromise(
    new Promise ( function (resolve, reject) {
      setTimeout(() => {
        resolve('from obs 1!!');
      }, 2000);
    })
  );

  const $obs2 = Observable.fromPromise(
    new Promise ( function (resolve, reject) {
      setTimeout(() => {
        resolve('from obs 2!!');
      }, 4000);
    })
  );


  // $obs1.subscribe(val => console.log(val));
  // $obs2.subscribe(val => console.log(val));

  // Aguarda os dois observables executarem para exibir os resutados
  const $sample = forkJoin(
    $obs1,
    $obs2
  );

  $sample
    .pipe(
      flatMap(result => result),
    ).subscribe(val => console.log(val)); 

}

function concatAllSample() {

  const source = interval(2000);

  const sample = source
    .pipe(
      map(val => of(val + 10)),
      concatAll()
    );

  sample.subscribe(val => console.log('concatAllSample: ', val));

}

function mergeAllSample() {

  const myPromise = function(val, timeout) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        resolve(`Result: ${val}`);
      }, timeout);
    });
  }

  const source = of(1, 2, 3);

  const example = source
    .pipe(
      map(val => myPromise(val, val * 1000)),
      mergeAll(),
    );

  example.subscribe(val => console.log(val));

}


module.exports.switchMapSample = switchMapSample;
module.exports.forkJoinSample = forkJoinSample;
module.exports.concatAllSample = concatAllSample;
module.exports.mergeAllSample = mergeAllSample;