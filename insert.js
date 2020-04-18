const merk = require('merk');
const getDataContractFixture = require(
  '@dashevo/dpp/lib/test/fixtures/getDataContractFixture',
);
const randomId = require(
  '@dashevo/dpp/lib/test/utils/generateRandomId',
);

// number of documents to put into db with one commit
const BATCHSIZE = 1000;

// absolute number of documents to insert into db in one run
const DBSIZE = 100000;

// create or load store
let db = merk('./state.db');

let value1;
let key1;

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
    value1 = db.getSync(Buffer.from(key1));

  // create merkle proof
    const proof1 = db.prove([
      Buffer.from(key1)
    ]);
    console.log('proof1', proof1);
    console.log(`proof size ${proof1.length} bytes, ${proof1.length/1000} kb`);

  // update value
    db.batch()
      .put(Buffer.from(key1), Buffer.from('value1'))
      .commitSync();

  // delete value
    db.batch()
      .delete(Buffer.from(key1))
      .commitSync();

  // get merke root
    let root = db.rootHash();
    console.log('new root', root);
}


