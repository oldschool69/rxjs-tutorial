const Rx = require('rxjs/Rx');
const request = require('request');
const { timer, interval, forkJoin, of, Observable, concat, merge, from } = require('rxjs');
const {
	switchMap,
	mergeMap,
	flatMap,
	delay,
	take,
	concatAll,
	map,
	mergeAll,
	tap,
	pluck,
	toArray,
	filter,
	bufferCount,
	window,
	scan,
	debounce,
	debounceTime,
	publish
} = require('rxjs/operators');

const _ = require('lodash');
const {performance} = require('perf_hooks');

function zipSample() {
	let age$ = Observable.of(27, 25, 29);
	let name$ = Observable.of('Foo', 'Bar', 'Beer');
	let isDev$ = Observable.of(true, true, false);

	Observable.zip(age$, name$, isDev$, (age, name, isDev) => ({ age, name, isDev })).subscribe((x) => console.log(x));
}

function pluckSample() {
	const source$ = Observable.from([
		{ name: 'Joe', age: 30, job: { title: 'Developer', language: 'Javascript' } },
		{ name: 'Sarah', age: 35, job: { title: 'Developer', language: 'C++' } },
		{ name: 'Carlos', age: 28, job: { title: 'Designer', language: 'Photo Shop 3' } }
	]);

	source$
		.filter((employee) => employee.job.title === 'Developer')
		.map((x) => {
			console.log(x.job.title);
			return x;
		})
		.pluck('job', 'language')
		.toArray()
		.subscribe((language) => console.log(language));
}

function minSample() {
	Observable.of(2, 3, 4, -1, 8, -16).min().subscribe((x) => console.log(x));

	// Usign a more complex data type
	Observable.of({ age: 7, name: 'Foo' }, { age: 5, name: 'Bar' }, { age: 9, name: 'Beer' })
		.min((person1, person2) => (person1.age < person2.age ? -1 : 1))
		.subscribe((person) => console.log(person.name));
}

function switchMapSample() {
	const source = timer(0, 5000);

	const example = source.pipe(switchMap(() => interval(500)));

	example.subscribe((val) => console.log(val));
}

function forkJoinSample() {
	const $obs1 = Observable.fromPromise(
		new Promise(function(resolve, reject) {
			setTimeout(() => {
				resolve('from obs 1!!');
			}, 2000);
		})
	);

	const $obs2 = Observable.fromPromise(
		new Promise(function(resolve, reject) {
			setTimeout(() => {
				resolve('from obs 2!!');
			}, 4000);
		})
	);

	// $obs1.subscribe(val => console.log(val));
	// $obs2.subscribe(val => console.log(val));

	// Aguarda os dois observables executarem para exibir os resutados
	const $sample = forkJoin($obs1, $obs2);

	$sample.pipe(flatMap((result) => result)).subscribe((val) => console.log(val));
}

function changeValue(val) {
	return Observable.from(val).map((x) => {
		return x * 10;
	});
	//.take(1); //o take na funcao de retorno que ta fodendo
}

function concatAllSample() {
	const source = Observable.of([ 1, 2, 3, 4, 5 ]);

	source
		.flatMap((x) =>
			source.pipe(
				map((x) => {
					return changeValue(x);
				})
			)
		)
		.mergeAll(10) //para usar os operadores mergeAll e concatAll tem retornar um stream usando o operador pipe
		//.concatAll()
		.subscribe(
			(val) => {
				console.log('val: ', val);
			},
			(err) => {
				console.log(err);
			},
			() => {
				console.log('done!');
			}
		);

	console.log('end');
}

function mergeAllSample() {
	const myPromise = function(val, timeout) {
		return new Promise(function(resolve, reject) {
			setTimeout(() => {
				resolve(`Result: ${val}`);
			}, timeout);
		});
	};

	const source = of(1, 2, 3);

	const example = source.pipe(map((val) => myPromise(val, val * 1000)), mergeAll());

	example.subscribe((val) => console.log(val));
}

function concatSample() {
	//Juntando streams com Concat e Merge

	const arr1 = [ { name: 'Josh', age: 15 }, { name: 'Barbara', age: 12 }, { name: 'Mike', age: 15 } ];

	const arr2 = [ { name: 'Michela', age: 14 }, { name: 'Katrina', age: 13 }, { name: 'Marvin', age: 25 } ];

	// const $obs1 = Rx.Observable.from(arr1);
	// const $obs2 = Rx.Observable.from(arr2);

	const $obs1 = Rx.Observable.interval(100).map((val) => `Source 1: ${val}`).take(5);

	const $obs2 = Rx.Observable.interval(100).map((val) => `Source 2: ${val * 10}`).take(5);

	// $obs1
	//   .concat($obs2) // Junta as streams em sequencia, primeiro os valores de $obs1 e $obs2 em seguida
	//   .subscribe(value => {
	//     console.log('Concat: ' + value);
	//   }
	//  );

	$obs1
		.merge($obs2) // Nao espera a primeira stream finalizar para executar a segunda
		.subscribe((value) => {
			console.log('Merge: ' + value);
		});
}

function httpRequestScenario() {
	const ENDPOINT = 'users';
	const ROOT = 'https://jsonplaceholder.typicode.com';

	const makeRequest = function makeRequest(path) {
		return new Promise(function(resolve, reject) {
			request(path, function(err, response, body) {
				if (err) {
					reject(err);
				} else {
					resolve(JSON.parse(body)); // parse response body to JSON, otherwise mapping operation bellow fails
				}
			});
		});
	};

	const $obs = Rx.Observable.fromPromise(makeRequest(ROOT + '/' + ENDPOINT));

	$obs
		.flatMap((users) => users) // for each object emmit a observable
		.map((user) => user.website) //get only website data
		.filter((website) => website.endsWith('net') || website.endsWith('org')) //do some filtering
		.reduce(
			(data, website) => {
				// So retorna quando o source Observable completa a execução. primeiro parametro é o acumulador
				return {
					count: (data.count += 1),
					name_length: (data.name_length += website.length)
				};
			},
			{ count: 0, name_length: 0 }
		)
		.subscribe((result) => {
			const average_length = result.name_length / result.count;
			console.log('average length: ' + average_length);
		});

	$obs
		.flatMap((users) => users)
		.map((user) => user.website)
		.filter((website) => website.endsWith('net') || website.endsWith('org'))
		.scan(
			(data, website) => {
				// Mostra o resultado para cada site, acumulando no primeiro parâmetro 'data'
				return {
					website,
					count: (data.count += 1),
					name_length: (data.name_length += website.length)
				};
			},
			{ count: 0, name_length: 0 }
		)
		//take(2). //limita a quantidade de resultados
		.takeWhile((result) => result.count < 3) // retorna resultados quando uma condição é satisfeita
		.subscribe((partialResult) => {
			const average_length = partialResult.name_length / partialResult.count;
			console.log(
				'website: ' + partialResult.website + ' average length (' + partialResult.count + '): ' + average_length
			);
		});
}

function bufferCountSample() {
	const source = interval(1000).bufferCount(3).subscribe((x) => console.log(x));
}

function exhaustMapSample() {
	const obs1$ = interval(2000).take(5);
	const obs2$ = interval(1000).take(5);

	const res$ = obs1$.exhaustMap((x) => obs2$);

	res$.subscribe((x) => console.log(x));
}

function windowSample() {
	const source = timer(0, 1000);

	const example = source.pipe(window(interval(3000)));

	const count = example.pipe(scan((acc, curr) => acc + 1, 0));

	const subscribe = count.subscribe((val) => console.log(`Window ${val}:`));
	const subscribeTwo = example.pipe(mergeAll()).subscribe((val) => console.log(val));
}

function debounceSample() {
	const example = of('WAIT', 'ONE', 'SECOND', 'Last will display');

	const debounceExample = example
		.pipe(
			debounceTime(5000)
			// debounce(() => timer(1000))
		)
		.subscribe((val) => console.log(val));
}

function publishSample() {
	const source = interval(1000);

	const example = source.pipe(tap((_) => console.log('Do something')), publish());

	const subscribe = example.subscribe((val) => console.log(`Subscriber One: ${val}`));

	const subscribeTwo = example.subscribe((val) => console.log(`Subscriber Two: ${val}`));

	setTimeout(() => {
		example.connect();
	}, 5000);
}

function fetch(callerId) {
	return Rx.Observable
		.create((observer) => {
			let value = 0;

			const interval = setInterval(() => {
				if (value % 2 === 0) {
					observer.next(`***${callerId} => ${value}`);
				}
				value++;
				if (value === 12) {
					clearInterval(interval);
					observer.error('limit achieved');
				}
			}, 1000);
		})
		.retryWhen((errors) => {
			console.log(`Errors on ${callerId}, retry`);
			// return errors.delay(1000).take(2);
			return errors
				.delay(1000)
				.take(2)
				.concat(Rx.Observable.throw(new Error(`***${callerId} number of tries expired!!!`)));
		});
}

function retryWhenSample() {
	setTimeout(() => {
		const obs1 = fetch('obs 1').subscribe(
			(val) => {
				console.log(val);
			},
			(error) => {
				console.log('obs 1 error: ', error);
			},
			() => {
				console.log('obs 1 completed');
			}
		);
	}, 2000);

	setTimeout(() => {
		const obs2 = fetch('obs 2').subscribe(
			(val) => {
				console.log(val);
			},
			(error) => {
				console.log('obs 2 error: ', error);
			},
			() => {
				console.log('obs 2 completed');
			}
		);
	}, 10000);
}

function makeRequestInParallel(path) {
	const promise = new Promise(function(resolve, reject) {
		request(path, function(err, response, body) {
			if (err) {
				reject(err);
			} else {
				resolve(response);
			}
		});
	});

	return Observable.fromPromise(promise).take(1);
}

function requestsInParallel() {
  
  const sitesMap = { 'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {},  
  'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {},
  'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {},
  'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {},
  'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {},
  'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {} };

	const sites = _.keys(sitesMap);

	const sitesObs = Observable.of(sites);

  const executions = [];
  
  const t0 = performance.now();

	sitesObs
		.flatMap((sites) => sites)
		.map((site) => {
			//console.log(site);
			executions.push(makeRequestInParallel(site));
			return site;
		})
		.subscribe(
			(site) => {
				//console.log(site);
			},
			(error) => {
				//console.log(error);
			},
			() => {
				//console.log("statusCode: ", response.statusCode);
				const executeRequestsObs = Observable.forkJoin(executions).flatMap(response => response);
        executeRequestsObs
          .subscribe(
            (response) => {
              // console.log(response.statusCode);
            },
            (error) => {
              // console.log(error);
            },
            () => {
              const t1 = performance.now();
              console.log("done v1 in " + (t1 - t0) + " milliseconds.")
            }
          );
			}
		);
}


function requestsInParallel_v2() {
  
  const sitesMap = { 'https://google.com': {}, 'http://facebook.com': {}, 'https://santander.com.br': {} };

	const sites = _.keys(sitesMap);

	const sitesObs = Observable.of(sites);

	const t0 = performance.now();
	
	const skus = ['SKU_1', 'SKU_2', 'SKU_3'];

	const executions = [];

	sitesObs
		.flatMap((sites) => sites)
		.flatMap((site) => {
			console.log(site);
			skus.forEach(sku => {
				executions.push(makeRequestInParallel(site));
			})
			return skus;
		})
		.subscribe(
			(skus) => {
				console.log(skus);
			},
			(error) => {
				console.log(error);
			},
			() => {
				//console.log(executions);
				Observable.forkJoin(executions)
					.flatMap(response => response)
					.subscribe(response => {
						console.log(response.statusCode);
					},
					(error) => {
						console.log(error);
					},
					() => {
						const t1 = performance.now();
						console.log("done v2 in " + (t1 - t0) + " milliseconds.");
					})
      }
		);
}


module.exports.switchMapSample = switchMapSample;
module.exports.forkJoinSample = forkJoinSample;
module.exports.concatAllSample = concatAllSample;
module.exports.mergeAllSample = mergeAllSample;
module.exports.concatSample = concatSample;
module.exports.httpRequestScenario = httpRequestScenario;
module.exports.zipSample = zipSample;
module.exports.minSample = minSample;
module.exports.pluckSample = pluckSample;
module.exports.bufferCountSample = bufferCountSample;
module.exports.exhaustMapSample = exhaustMapSample;
module.exports.windowSample = windowSample;
module.exports.debounceSample = debounceSample;
module.exports.publishSample = publishSample;
module.exports.retryWhenSample = retryWhenSample;
module.exports.requestsInParallel = requestsInParallel;
module.exports.requestsInParallel_v2 = requestsInParallel_v2;
