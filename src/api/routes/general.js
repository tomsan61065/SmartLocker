'use strict';

const express = require('express');

const router = express.Router();

var { web3, eth } = require('../util/web3Setup');

router.post('/', (req, res) => {
  console.log(req);
  res.json({
    result: req.body,
  });
});

router.get('/sendRawTransaction', async (req, res) => {
  var result = await web3.eth.sendSignedTransaction(req.rawTransaction);
  console.log(result);
  return true;
});

module.exports = router;
