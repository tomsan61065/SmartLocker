'use strict';
//細節說明先看token.js
//http://expressjs.com/zh-tw/guide/routing.html
const express = require('express'); 
const keythereum = require('keythereum');
const userKeyfile = require('../../keyfile/mykey.json');
const util = require("ethereumjs-util");

const router = express.Router();
const AES = require("crypto-js").AES;
const ecies = require("eth-ecies");
const request = require("request");

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
  //"0xAd728b56377E54869E8131406745986d16ed2655", // <============= token address 要自己給
  //"0x856B8Ff4A21E0992fCbff2aBae9F2E38A067b9d0", //新版 address
  "0xF0B061d189da1E692d13bB3E802d628920D1E255", //mapping 改 address array
);

router.get('/', (req, res) => {
  res.send('this is locker api');
});

router.get("/create" , async(req, res) => {

  let myContract = new web3.eth.Contract(
    LockerAbi,
    { gas: 4700000, gasPrice: 0 },
  );

  let data = await myContract
  .deploy({
    data: LockerBin,
    arguments: ["0x3e0315B3dAA3C888EfA5a0F5AC75db97f1c01437"], //nccu token address required
  }).encodeABI();

  let privateKey = await keythereum.recover('techfin', userKeyfile);
  let nonce = await web3.eth.getTransactionCount('0x' + userKeyfile.address);

  let transaction = {
    data,
    nonce,
    gas: 0x47b760,
    gasPrice: 0,
    value: '0x0',
  };

  let rawTx = signTX(privateKey, transaction);

  web3.eth.sendSignedTransaction(rawTx).on("receipt", (receipt) => {
  //  lockerContract.options.address = receipt.contractAddress;
    console.log(receipt.contractAddress);
    
    res.json({
      test: "test",
      //address : lockerContract.options.address, //如果不是在promise裡面，而是在外邊會變成 "address":null
    });
  })
  .on("error", console.log);

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
  var symkey = "";

  let privateKey = await keythereum.recover('techfin', userKeyfile); //這要花5秒生成，太慢
  let publicKey = util.privateToPublic(privateKey).toString("hex"); 
//  console.log(publicKey);
  request('http://localhost:3000/verify_1/' + publicKey, async function (error, response, body) { 
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //  console.log('body:', body); // Print the HTML for the Google homepage.
    symkey = await decrypt(privateKey, body);
    let returnData = await AES.encrypt("0x" + userKeyfile.address, symkey).toString();
  //  console.log(returnData);
    
    request('http://localhost:3000/verify_2/' + returnData, function (error, response, body){
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });

  });

  res.send("open lock");
});

function decrypt(privateKey, encryptedData) {
  let userPrivateKey = new Buffer(privateKey, 'hex');
  let bufferEncryptedData = new Buffer(encryptedData, 'base64');

  let decryptedData = ecies.decrypt(userPrivateKey, bufferEncryptedData);
  
  return decryptedData.toString('utf8');
}

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


//@address _others
router.post("/addWhiteList", async (req, res) => {
  let privateKey = await keythereum.recover("techfin", userKeyfile);
  let nonce = await web3.eth.getTransactionCount("0x" + userKeyfile.address);
  let _others = req.body.others;
  let data = await lockerContract.methods.addWhiteList(_others).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on("receipt", console.log);
});

//@address _others
router.post("/removeWhiteList", async (req, res) => {
  let privateKey = await keythereum.recover("techfin", userKeyfile);
  let nonce = await web3.eth.getTransactionCount("0x" + userKeyfile.address);
  let _others = req.body.others;
  let data = await lockerContract.methods.removeWhiteList(_others).encodeABI();

  let transaction = {
    data,
    nonce,
    gas: 2000000,
    gasPrice: 0,
    to: lockerContract.options.address,
    value: "0x0",
  };

  let rawTx = signTX(privateKey, transaction);
  web3.eth.sendSignedTransaction(rawTx).on("receipt", console.log);
});

//有無被租借
router.get("/isOwned", async(req, res) => {

  let address = await lockerContract.methods.owner().call();

  res.json({
    address: address,
  });
});


module.exports = router;
