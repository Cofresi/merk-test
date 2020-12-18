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
  let result;
  try {
    result = await client.quorum('info', 1, '000000000000000f3bceed610a251eae4f9f3b462b13b4f621d55729072c106c');
  } catch (e) {
    // Non-existent quorumHash-llmqType combination
      throw e;
  }
  return result;
}
init().then(r => console.log('res', r));
