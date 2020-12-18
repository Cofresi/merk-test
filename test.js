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
  const result = await client.quorum('list');
  console.log('res', result);
}
init();
