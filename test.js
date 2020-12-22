const RpcClient = require('@dashevo/dashd-rpc/promise');

/**
 * Create Core JSON RPC Client
 *
 * @typedef createRpcClient
 * @param {Object} [config]
 * @param {string} [config.protocol=http]
 * @param {string} [config.user=dashrpc]
 * @param {string} [config.pass=password]
 * @param {string} [config.host=127.0.0.1]
 * @param {number} [config.port=20002]
 * @return {RpcClient|PromisifyModule}
 */
function createRpcClient(config = {}) {
  // eslint-disable-next-line no-param-reassign
  config = {
    protocol: 'http',
    user: 'dashcore1',
    pass: 'passw1',
    host: '127.0.0.1',
    port: 19998,
    ...config,
  };

  return new RpcClient(config);
}
async function init() {
  const client = createRpcClient();
  try {
    const {
      result: {
        members: validators,
      },
    } = await client.quorum('info', 1, '000000026f2252a4e79ea78cc9eb19ae57905a17d363ce500596e3f3bad918ce');
//  result = await client.quorum('list');
    return validators;
  } catch (e) {
    // Non-existent quorumHash-llmqType combination
    throw e;
  }
}
init().then(val => console.log('res', val));
