'use strict';
//細節說明先看token.js
//http://expressjs.com/zh-tw/guide/routing.html
const express = require('express'); 
const keythereum = require('keythereum');
const userKeyfile = require('../../keyfile/mykey.json');

const router = express.Router();

var {
  web3,
  eth,
  getNCCUTokenDeployData,
  NCCUToken,
  NCCUTokenAbi,
} = require('../util/web3Setup');
var {
  NCCUTokenAbi,
  NCCUTokenBin,
  LockerAbi,
  LockerBin,
} = require('../../data/resource');
const { signTX } = require('../util/signTx.js'); 

// export { specialty as chefsSpecial, isVegetarian as isVeg, isLowSodium };
// import { chefsSpecial, isVeg } from './menu';

var lockerContract = new web3.eth.Contract(
  LockerAbi,
//  { gas: 4000000, gasPrice: '500000000000' }, //不給會怎樣?? 沒差會自己抓
  //要自己給 contract address
  "0xAd728b56377E54869E8131406745986d16ed2655",
);

router.get('/', (req, res) => {
  res.send('this is locker api');
});

router.get("/create" , async(req, res) => {

  let myContract = new web3.eth.Contract(
    LockerAbi,
    { gas: 4000000, gasPrice: 0 },
  );

  let data = await myContract
  .deploy({
    data: LockerBin,
    arguments: ["0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437"], //ncco token address required
  }).encodeABI();

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  let transaction = {
    data,
    nonce,
    gas: 4000000,
    gasPrice: 0,
    value: '0x0',
  };

  let rawTx = signTX(privateKey, transaction);

  web3.eth.sendSignedTransaction(rawTx).on("receipt", (receipt) => {
    lockerContract.options.address = receipt.contractAddress;
    console.log(receipt.contractAddress);
    
    res.json({
      address : lockerContract.options.address, //如果不是在promise裡面，而是在外邊會變成 "address":null
    });
  });

});


router.get("/rentLock", async (req, res) => {

  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  //nonce 如何得到? 看來需要吃到accounts的參數 -> 確實要先要到
  let data = await lockerContract.methods.rentLock().encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  //送出去簽名
  //另一個api接回來?

  //學長是 client 本地端產生 Tx 並 Sign 後發到 server  

  //先本地簽測試
  /* 第一個就是 admin
  (0) 0x47c6642087f1d707cff7d157d322bf2506cae123693205ebe821b299f95043fe 
  (1) 0x93616ba48d2c1a54607c1ef7d620f77c0bc3462574e78a439220dfcb539e2650
  (2) 0x2da5aac88378af33b52f84148d6bb63bfd76c3c70d39ecff38373faff7b0bed3
  */
  let privateKey = await keythereum.recover('techfin', userKeyfile);

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("rent lock");
});

router.get("/returnLock", async (req, res) => {

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let data = await lockerContract.methods.returnLock().encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  }; 

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("return lock");
});

router.get("/openLock", async (req, res) => {

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let data = await lockerContract.methods.openLock().encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("open lock");
});

// @uint256 _value
router.post("/changePrice", async (req, res) => {
  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let _value = req.body.value;
  let data = await lockerContract.methods.changePrice(_value).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("change price to " + _value);
});

// @address _tokenAddress
router.post("/changeTokenAddress", async (req, res) => {
  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let _tokenAddress = req.body.tokenAddress;
  let data = await lockerContract.methods.changeTokenAddress(_tokenAddress).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("change address to: " + _tokenAddress);
});

// @uint _decimal
router.post("/setDecimal", async (req, res) => {
  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let _decimal = req.body.decimal;
  let data = await lockerContract.methods.setDecimal(_decimal).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send("set decimal to: " + _decimal);
});

// @address _to
// getTokenBack return 的 bool 會在哪?
router.post("/getTokenBack", async (req, res) => {
  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);
  let _to = req.body.to;
  let data = await lockerContract.methods.getTokenBack(_to).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log);

  res.send({
    to: _to,
  });
});

module.exports = router;
