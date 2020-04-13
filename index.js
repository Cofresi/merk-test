let merk = require('merk')

// create or load store
let db = merk('./state.db');

// put value
db.batch()
  .put(Buffer.from('key1'), Buffer.from('value1'))
  .put(Buffer.from('key2'), Buffer.from('value2'))
  .commitSync();

// get value
let value1 = db.getSync(Buffer.from('key1'));
let value2 = db.getSync(Buffer.from('key2'));
console.log('key1', value1.toString());
console.log('key2', value2.toString());

// get Merkle root
let hash = db.rootHash();
console.log('hash', hash);

// create merkle proof
let proof = db.prove([
  Buffer.from('key1'),
  Buffer.from('value1')
]);
console.log('proof', proof);

let res = db.verify(proof, [Buffer.from('key1'), Buffer.from('value1')]);

// modify values
db.batch()
  .put(Buffer.from('key1'), Buffer.from('value3'))
  .put(Buffer.from('key2'), Buffer.from('value4'))
  .delete(Buffer.from('key1'))
  .delete(Buffer.from('key2'))
  .commitSync();

// get value
value1 = db.getSync(Buffer.from('key1'));
value2 = db.getSync(Buffer.from('key2'));
console.log('value key1', value1.toString());
console.log('value key2', value2.toString());
