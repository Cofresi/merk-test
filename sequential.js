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
const BATCHSIZE = 1000000;
const ENDIAN = 'big';

let value1;
let key1;
const isMac = process.platform === "darwin";

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
  if (isMac) {
    return db.prove([
      Buffer.from(key)
    ]);
  }
  return db.proveSync([
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

function fillInputDocumentArray(random = true, endian = 'big') {
  let inputDocuments = [];
  for (y = 0; y < BATCHSIZE; y++) {
    const dataContract = getDataContractFixture(randomId());
    const bufDataContract = Buffer.from(JSON.stringify(dataContract));
    let inputKey;
    if (random) {
      inputKey = Buffer.from(dataContract.id, 'utf8');
    } else {
      if (endian === 'big'){
        inputKey = Buffer.allocUnsafe(2);
        inputKey.writeUInt16BE(y);  // Big endian
      } else {
        inputKey = Buffer.allocUnsafe(4);  // Init buffer without writing all data to zeros
        inputKey.writeInt32LE(y);  // Little endian this time..
      }
    }
    inputDocuments.push({ key: inputKey, value: bufDataContract });
    if (y === 0) {
      key1 = inputKey;
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

// create or load store for random keys
const db = merk('./random.db');

// get merkle root
let initialRoot = db.rootHash();
console.log('initialRoot', initialRoot);

for (i = 0; i < 1; i++) {

  obs.observe({ entryTypes: ['function'] });

  console.log(`Fill up tree with ${BATCHSIZE} random keys`);

  // fill up inputDocuments array with random keys
  const inputDocuments = benchfillInputDocumentArray();

  // **** BENCHMARK OPS ****

  obs.observe({ entryTypes: ['function'] });

  // commit block with random keys
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

  // create or load store for random keys
  const db2 = merk('./sequential.db');

  // get merke root
  const root = benchGetRoot(db2);
  console.log('new root', root);

  obs.observe({ entryTypes: ['function'] });

  console.log(`Fill up tree with ${BATCHSIZE} sequential keys`, `${ENDIAN} endian`);

  // fill up inputDocuments array with sequential keys
  const inputDocuments2 = benchfillInputDocumentArray(false, ENDIAN);

  // **** BENCHMARK OPS ****

  obs.observe({ entryTypes: ['function'] });

  // commit block with random keys
  benchGommitBlock(db2, inputDocuments2);

  obs.observe({ entryTypes: ['function'] });

  // get value
  value1 = benchGetValue(db2, key1);

  obs.observe({ entryTypes: ['function'] });

  // create merkle proof
  const proof2 = benchGetProof(db2, key1);
  console.log(`proof ${i + 1}`, proof2);
  console.log(`proof size ${proof2.length} bytes, ${proof2.length/1000} kb`);

  obs.observe({ entryTypes: ['function'] });

  // update value
  benchUpdateValue(db2, key1, 'value1');

  obs.observe({ entryTypes: ['function'] });

  // delete value
  benchDeleteKey(db2, key1);

  obs.observe({ entryTypes: ['function'] });

  // get merkle root
  const root2 = benchGetRoot(db2);
  console.log('new root', root2);

  obs.observe({ entryTypes: ['function'] });
}
