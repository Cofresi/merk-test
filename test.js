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
//    } = await client.quorum('info', 1, '000000026f2252a4e79ea78cc9eb19ae57905a17d363ce500596e3f3bad918ce');
    } = await client.quorum('verify', 1, '2ceeaa7ff20de327ef65b14de692199d15b67b9458d0ded7d68735cce98dd039', '8b5174d0e95b5642ebec23c3fe8f0bbf8f6993502f4210322871bba0e818ff3b', '99cf2a0deb08286a2d1ffdd2564b35522fd748c8802e561abed330dea20df5cb5a5dffeddbe627ea32cb36de13d5b4a516fdfaebae9886b2f7969a5d112416cf8d1983ebcbf1463a64f7522505627e08b9c76c036616fbb1649271a2773a1653', '000000583a348d1a0a5f753ef98e6a69f9bcd9b27919f10eb1a1c3edb6c79182');
//  result = await client.quorum('list');
    return validators;
  } catch (e) {
    // Non-existent quorumHash-llmqType combination
    if (e.code === -8) {
      console.log('bla error bla')
    } else {
      throw e;
    }
  }
}
init().then(val => console.log('res', val));
