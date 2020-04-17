const merk = require('merk');
const getDataContractFixture = require(
  '@dashevo/dpp/lib/test/fixtures/getDataContractFixture',
);
const randomId = require(
  '@dashevo/dpp/lib/test/utils/generateRandomId',
);

// number of documents to put into db with one commit
const BATCHSIZE = 1000;

// create or load store
let db = merk('./state.db');

let value1;
let value2;
let key1;
let key1000;

// get Merkle root
let initialRoot = db.rootHash();
console.log('initialRoot', initialRoot);

let inputDocuments = [];
for (i = 0; i < BATCHSIZE; i++) {
  const dataContract = getDataContractFixture(randomId());
  const bufDataContract = Buffer.from(JSON.stringify(dataContract));
  inputDocuments.push({ key: Buffer.from(dataContract.id, 'utf8'), value: bufDataContract });
  if (i === 0) {
    key1 = dataContract.id;
  }
  if (i === BATCHSIZE - 1) {
    key1000 = dataContract.id;
  }
}

const batch = db.batch();
for (const keyValuePair of inputDocuments) {
// put value
  batch
    .put(Buffer.from(keyValuePair.key), Buffer.from(keyValuePair.value))
}
batch.commitSync();
console.log(`inserted batch with ${BATCHSIZE} documents`);

// **** BENCHMARK OPS ****

// get Merkle root
let root = db.rootHash();
console.log('new root', root);

// get values
value1 = db.getSync(Buffer.from(key1));
value2 = db.getSync(Buffer.from(key1000));
console.log('key1', value1.toString());
console.log('key1000', value2.toString());

// create merkle proof
const proof1 = db.prove([
  Buffer.from(key1)
]);
const proof1000 = db.prove([
  Buffer.from(key1000)
]);

console.log('proof1', proof1);
console.log('proof1000', proof1000);

// update values
db.batch()
  .put(Buffer.from(key1), Buffer.from('value1'))
  .put(Buffer.from(key1000), Buffer.from('value1000'))
  .commitSync();

// get new Merkle root after update
let root2 = db.rootHash();
console.log('root2', root2);

// delete values
db.batch()
  .delete(Buffer.from(key1))
  .commitSync();

// get Merkle root
let root3 = db.rootHash();
console.log('root3', root3);
