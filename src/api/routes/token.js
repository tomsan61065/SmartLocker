'use strict';

const express = require('express');
const keythereum = require('keythereum');
const userKeyfile = require('../../keyfile/mykey.json');

//http://expressjs.com/zh-tw/guide/routing.html
const router = express.Router(); 

var {
  web3,
  eth,
  getNCCUTokenDeployData,
  NCCUToken,
  NCCUTokenAbi,
} = require('../util/web3Setup'); //將 web3Setup 的變數引入
const { admin } = require('../util/admin.js'); //跟mykey.json一樣的東西，沒用到。
const { signTX } = require('../util/signTx.js'); //一個 singTx的 function，分開寫

//這邊 94 contract的 binarycode
const remixInputData =
  '0x60806040526301e133806003553480156200001957600080fd5b5060405162001b1938038062001b1983398101806040528101908080518201929190602001805182019291906020018051906020019092919080519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508260049080519060200190620000b7929190620001eb565b508360059080519060200190620000d0929190620001eb565b5081600681905550600654600a0a8102600781905550600754600860008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555060035442016002819055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6007546040518082815260200191505060405180910390a3505050506200029a565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200022e57805160ff19168380011785556200025f565b828001600101855582156200025f579182015b828111156200025e57825182559160200191906001019062000241565b5b5090506200026e919062000272565b5090565b6200029791905b808211156200029357600081600090555060010162000279565b5090565b90565b61186f80620002aa6000396000f300608060405260043610610112576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063026f38b51461011757806306fdde031461019c578063095ea7b31461022c5780630f664ba51461029157806318160ddd146102bc5780631f854404146102e757806323b872dd14610312578063313ce567146103975780633eaaf86b146103c257806370a08231146103ed57806379ba5097146104445780638da5cb5b1461045b57806395d89b41146104b2578063a9059cbb14610542578063cae9ca51146105a7578063d48c7abc14610652578063d4ee1d9014610697578063dc39d06d146106ee578063dd62ed3e14610753578063f2fde38b146107ca575b600080fd5b34801561012357600080fd5b50610182600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061080d565b604051808215151515815260200191505060405180910390f35b3480156101a857600080fd5b506101b161096b565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101f15780820151818401526020810190506101d6565b50505050905090810190601f16801561021e5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561023857600080fd5b50610277600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a09565b604051808215151515815260200191505060405180910390f35b34801561029d57600080fd5b506102a6610b0b565b6040518082815260200191505060405180910390f35b3480156102c857600080fd5b506102d1610b11565b6040518082815260200191505060405180910390f35b3480156102f357600080fd5b506102fc610b5c565b6040518082815260200191505060405180910390f35b34801561031e57600080fd5b5061037d600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b62565b604051808215151515815260200191505060405180910390f35b3480156103a357600080fd5b506103ac610e1d565b6040518082815260200191505060405180910390f35b3480156103ce57600080fd5b506103d7610e23565b6040518082815260200191505060405180910390f35b3480156103f957600080fd5b5061042e600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610e29565b6040518082815260200191505060405180910390f35b34801561045057600080fd5b50610459610e72565b005b34801561046757600080fd5b50610470611011565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156104be57600080fd5b506104c7611036565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156105075780820151818401526020810190506104ec565b50505050905090810190601f1680156105345780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561054e57600080fd5b5061058d600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506110d4565b604051808215151515815260200191505060405180910390f35b3480156105b357600080fd5b50610638600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919291929050505061127f565b604051808215151515815260200191505060405180910390f35b34801561065e57600080fd5b5061067d600480360381019080803590602001909291905050506114de565b604051808215151515815260200191505060405180910390f35b3480156106a357600080fd5b506106ac61154b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156106fa57600080fd5b50610739600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611571565b604051808215151515815260200191505060405180910390f35b34801561075f57600080fd5b506107b4600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506116d5565b6040518082815260200191505060405180910390f35b3480156107d657600080fd5b5061080b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061176c565b005b60004260025411151561081f57600080fd5b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561087a57600080fd5b81600960008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167ff0d465393e184046b6af099d59986049febbc158ebee971356ca3749ec40a64f846040518082815260200191505060405180910390a3600190509392505050565b60058054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a015780601f106109d657610100808354040283529160200191610a01565b820191906000526020600020905b8154815290600101906020018083116109e457829003601f168201915b505050505081565b600042600254111515610a1b57600080fd5b81600960003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b60025481565b6000600860008073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205460075403905090565b60035481565b600042600254111515610b7457600080fd5b610bc682600860008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461180b90919063ffffffff16565b600860008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610c9882600960008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461180b90919063ffffffff16565b600960008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610d6a82600860008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461182790919063ffffffff16565b600860008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3600190509392505050565b60065481565b60075481565b6000600860008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610ece57600080fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60048054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156110cc5780601f106110a1576101008083540402835291602001916110cc565b820191906000526020600020905b8154815290600101906020018083116110af57829003601f168201915b505050505081565b6000426002541115156110e657600080fd5b61113882600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461180b90919063ffffffff16565b600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506111cd82600860008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461182790919063ffffffff16565b600860008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905092915050565b60004260025411151561129157600080fd5b82600960003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925856040518082815260200191505060405180910390a38373ffffffffffffffffffffffffffffffffffffffff16638f4ffcb1338530866040518563ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018481526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200180602001828103825283818151815260200191508051906020019080838360005b8381101561146c578082015181840152602081019050611451565b50505050905090810190601f1680156114995780820380516001836020036101000a031916815260200191505b5095505050505050600060405180830381600087803b1580156114bb57600080fd5b505af11580156114cf573d6000803e3d6000fd5b50505050600190509392505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561153b57600080fd5b8160028190555060019050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156115ce57600080fd5b8273ffffffffffffffffffffffffffffffffffffffff1663a9059cbb6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff16846040518363ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050602060405180830381600087803b15801561169257600080fd5b505af11580156116a6573d6000803e3d6000fd5b505050506040513d60208110156116bc57600080fd5b8101908080519060200190929190505050905092915050565b6000426002541115156116e757600080fd5b600960008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156117c757600080fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600082821115151561181c57600080fd5b818303905092915050565b6000818301905082811015151561183d57600080fd5b929150505600a165627a7a723058207e1d5e764176d291a16573fda2172d66e71f6d392fad219dc8c0d7af494b6e2a0029000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000054f05c000000000000000000000000000000000000000000000000000000000000000a4e43435520546f6b656e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044e43435500000000000000000000000000000000000000000000000000000000';

const sample = {
  chainId: 42,
  data:
    '0xa9059cbb0000000000000000000000003e7af8b8c19c404670c1470273bca449148df4ed00000000000000000000000000000000000000000000003635c9adc5dea00000',
  gas: '0xae8a',
  gasPrice: '0x3b9aca00',
  nonce: '0x57',
  to: '0x3830f7Af866FAe79E4f6B277Be17593Bf96beE3b',
  value: '0x0',
};

router.get('/', (req, res) => { // 是 localhost:port/token/ 的訊息
  res.send('this is fucking nccu token api');
});

router.get('/create', async (req, res) => {
  // var keyInfo = await web3.eth.accounts.wallet.decrypt([admin], 'techfin');
  let data = await getNCCUTokenDeployData('NCCU Token', 'NCCU', 18, 5566556);
  // keyInfo = keyInfo['0'];

  // console.log(remixInputData.localeCompare(data));

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  let transaction = {
    data: remixInputData,
    nonce,
    gas: 4000000,
    gasPrice: 0,
    value: '0x0',
  };

  let rawTx = signTX(privateKey, transaction);

  web3.eth.sendSignedTransaction(rawTx).on('receipt', (receipt) => {
    console.log(receipt.contractAddress)
  });

  res.json({
    rawTx,
  });
});

let sampleTX =
  '0x49ad752a0f65b3650fb7361a1050c2335e9cec6040cf3b400441e07d6750decf';
let sampleContract = '0xdf7518fE1aE19E8e4A74F1d17d99c852814eA30b';

router.post('/transfer', async (req, res) => { //https://ethereum.stackexchange.com/questions/24828/how-to-send-erc20-token-using-web3-api
  let toSign = {}; //看web3Setup, tosign就是data

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  const myContract = new web3.eth.Contract(
    NCCUTokenAbi,
    '0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437',
  );

  let _to = req.body.to;
//  console.log("the to : " + _to);
  let _value = req.body.value;

  let data = await myContract.methods.transfer(_to, _value).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    //from: "0x52da64497cc678d5fe56379e93fbc3a25293b0cc", //不一定要提供，在 sign 的時候就會有
    to: "0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437",
    value: "0x0",
    //chainId: 0x01 //可選，子傑說千萬不要有，更動會很難改
  };

  let rawTx = signTX(privateKey, transaction);

  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.json({
    data,
    gas: 2000000,
    gasPrice: 0,
  });
});

router.get('/testing', async (req, res) => {
  const counting = await eth.getTransactionCount('0x' + userKeyfile.address);
  res.json({
    result: counting,
  });
});

router.get('/balanceOf', async (req, res) => {
  const myContract = new web3.eth.Contract(
    NCCUTokenAbi,
    '0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437',
  );

  let balance = await myContract.methods.balanceOf(userKeyfile.address).call();

  res.send({
    balance,
  });
});

router.post('/approve', async (req, res) => {
  let _spender = req.body.spender;
  let _value = req.body.value;
  
  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  const myContract = new web3.eth.Contract(
    NCCUTokenAbi,
    '0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437',
  );

  let data = await myContract.methods.approve(_spender, _value).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: "0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437",
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);

  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.json({
    _spender,
    _value,
  });

});

router.post('/allowance', async (req, res) => {
  let tokenOwner = req.body.tokenOwner;
  let spender = req.body.spender;

  const myContract = new web3.eth.Contract(
    NCCUTokenAbi,
    '0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437',
  );

  let allowance = await myContract.methods.allowance(tokenOwner, spender).call();

  res.send({
    allowance,
  });

});

module.exports = router;