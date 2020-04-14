let merk = require('merk')

// create or load store
let db = merk('./state.db');

let value1;
let value2;

// get Merkle root
let root = db.rootHash();
console.log('root', root);

// put value
db.batch()
  .put(Buffer.from('key1'), Buffer.from('value1'))
  .put(Buffer.from('key2'), Buffer.from('value2'))
  .commitSync();

// get value
value1 = db.getSync(Buffer.from('key1'));
value2 = db.getSync(Buffer.from('key2'));
console.log('key1', value1.toString());
console.log('key2', value2.toString());

// get Merkle root
let root1 = db.rootHash();
console.log('root1', root1);

// create merkle proof
let proof = db.prove([
  Buffer.from('key1'),
  Buffer.from('value1')
]);
console.log('proof', proof);

// modify values
db.batch()
  .put(Buffer.from('key1'), Buffer.from('value3'))
  .put(Buffer.from('key2'), Buffer.from('value4'))
  .commitSync();

// get Merkle root
let root2 = db.rootHash();
console.log('root2', root2);

// get value
value1 = db.getSync(Buffer.from('key1'));
value2 = db.getSync(Buffer.from('key2'));
console.log('key1', value1.toString());
console.log('key2', value2.toString());

// delete values
db.batch()
  .delete(Buffer.from('key1'))
  .delete(Buffer.from('key2'))
  .commitSync();

// get Merkle root
let root3 = db.rootHash();
console.log('root3', root3);
