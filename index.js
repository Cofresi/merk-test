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

let value1;
let key1;

function commitBlock(db, inputDocuments) {
  const batch = db.batch();
  for (const keyValuePair of inputDocuments) {
// put value
    batch
      .put(Buffer.from(keyValuePair.key), Buffer.from(keyValuePair.value))
  }
  batch.commitSync();
  console.log(`inserted batch with ${BATCHSIZE} documents`);
}

function getValue(db, key) {
  return db.getSync(Buffer.from(key));
}

function getProof(db, key) {
  return db.prove([
    Buffer.from(key)
  ]);
}

function put(db, key, value) {
  db.batch()
    .put(Buffer.from(key), Buffer.from(value))
    .commitSync();
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

function fillInputDocumentArray() {
  let inputDocuments = [];
  for (y = 0; y < BATCHSIZE; y++) {
    const dataContract = getDataContractFixture(randomId());
    const bufDataContract = Buffer.from(JSON.stringify(dataContract));
    inputDocuments.push({ key: Buffer.from(dataContract.id, 'utf8'), value: bufDataContract });
    if (y === 0) {
      key1 = dataContract.id;
    }
  }
  return inputDocuments;
}

const benchGommitBlock = performance.timerify(commitBlock);
const benchGetValue = performance.timerify(getValue);
const benchGetProof = performance.timerify(getProof);
const benchUpdateValue = performance.timerify(updateValue);
const benchDeleteKey = performance.timerify(deleteKey);
const benchGetRoot = performance.timerify(getRoot);
const benchfillInputDocumentArray = performance.timerify(fillInputDocumentArray);

const obs = new PerformanceObserver((list) => {
  const entry = list.getEntries()[0];
  console.log(entry.name, entry.duration, 'ms');
  obs.disconnect();
});

// create or load store
const db = merk('./state.db');

// get merkle root
let initialRoot = db.rootHash();
console.log('initialRoot', initialRoot);

for (i = 0; i < 1; i++) {

  obs.observe({ entryTypes: ['function'] });

  // fill up inputDocuments array
  const inputDocuments = benchfillInputDocumentArray();

  // **** BENCHMARK OPS ****

  obs.observe({ entryTypes: ['function'] });

  // commit block
  benchGommitBlock(db, inputDocuments);

  obs.observe({ entryTypes: ['function'] });

  // get value
  value1 = benchGetValue(db, key1);

  obs.observe({ entryTypes: ['function'] });

  // create merkle proof
  const proof = benchGetProof(db, key1);
  console.log(`proof ${i + 1}`, proof);
  console.log(`proof size ${proof.length} bytes, ${proof.length/1000} kb`);

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
