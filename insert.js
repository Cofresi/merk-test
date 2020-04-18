const merk = require('merk');
const {
  performance,
  PerformanceObserver
} = require('perf_hooks');
const getDataContractFixture = require(
  '@dashevo/dpp/lib/test/fixtures/getDataContractFixture',
);
const randomId = require(
  '@dashevo/dpp/lib/test/utils/generateRandomId',
);

// number of documents to put into db with one commit
const BATCHSIZE = 1000;

// absolute number of documents to insert into db in one run
const DBSIZE = 10000000;

// create or load store
let db = merk('./state.db');

let value1;
let key1;

function getValue(db, key) {
  return db.getSync(Buffer.from(key));
}

function getProof(db, key) {
  return db.prove([
    Buffer.from(key)
  ]);
}

function updateValue(db, key, value) {
  db.batch()
    .put(Buffer.from(key), Buffer.from(value))
      .commitSync();
}

function deleteKey(db, key) {
  db.batch()
    .delete(Buffer.from(key))
    .commitSync();
}

function getRoot(db) {
  return db.rootHash();
}

const benchGetValue = performance.timerify(getValue);
const benchGetProof = performance.timerify(getProof);
const benchUpdateValue = performance.timerify(updateValue);
const benchDeleteKey = performance.timerify(deleteKey);
const benchGetRoot = performance.timerify(getRoot);

const obs = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(entry.name, entry.duration);
  });
  obs.disconnect();
});

// get Merkle root
let initialRoot = db.rootHash();
console.log('initialRoot', initialRoot);

for (i = 0; i < DBSIZE / BATCHSIZE; i++) {

  let inputDocuments = [];
  for (y = 0; y < BATCHSIZE; y++) {
    const dataContract = getDataContractFixture(randomId());
    const bufDataContract = Buffer.from(JSON.stringify(dataContract));
    inputDocuments.push({ key: Buffer.from(dataContract.id, 'utf8'), value: bufDataContract });
    if (y === 0) {
      key1 = dataContract.id;
    }
  }
  const batch = db.batch();
  for (const keyValuePair of inputDocuments) {
// put value
    batch
      .put(Buffer.from(keyValuePair.key), Buffer.from(keyValuePair.value))
  }
  batch.commitSync();
  console.log(`block ${i + 1} inserted batch with ${BATCHSIZE} documents`);

  // **** BENCHMARK OPS ****

  // get value
    value1 = benchGetValue(db, key1);

  obs.observe({ entryTypes: ['function'] });

  // create merkle proof
    const proof1 = benchGetProof(db, key1);
    console.log('proof1', proof1);
    console.log(`proof size ${proof1.length} bytes, ${proof1.length/1000} kb`);

  obs.observe({ entryTypes: ['function'] });

  // update value
  benchUpdateValue(db, key1, 'value1');

  obs.observe({ entryTypes: ['function'] });

  // delete value
  benchDeleteKey(db, key1);

  obs.observe({ entryTypes: ['function'] });

  // get merke root
    const root = benchGetRoot(db);
    console.log('new root', root);

  obs.observe({ entryTypes: ['function'] });
}
