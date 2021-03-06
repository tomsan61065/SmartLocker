const EthereumTx = require('ethereumjs-tx');

function signTX(_privatekey, _transaction) {
  // _transaction.gasLimit = _transaction.gas;
  // delete _transaction.gas;

  const tx = new EthereumTx(_transaction);
  tx.sign(_privatekey);
  const serializedTx = tx.serialize();
  return '0x' + serializedTx.toString('hex');
}

module.exports = { signTX };
